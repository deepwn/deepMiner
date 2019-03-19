(function(window) {
    "use strict";
    var Miner = function(userID, params) {
        this.params = params || {};
        this._userID = userID;
        this._threads = [];
        this._hashes = 0;
        this._currentJob = null;
        this._autoReconnect = true;
        this._reconnectRetry = 3;
        this._totalHashesFromDeadThreads = 0;
        this._throttle = Math.max(0, Math.min(0.99, this.params.throttle || 0));
        this._stopOnInvalidOptIn = false;
        this._selfTestSuccess = false;
        this._verifyThread = null;
        this._autoThreads = {
            enabled: !!this.params.autoThreads,
            interval: null,
            adjustAt: null,
            adjustEvery: 1e4,
            stats: {}
        };
        this._tab = {
            ident: (Math.random() * 16777215) | 0,
            mode: deepMiner.IF_EXCLUSIVE_TAB,
            grace: 0,
            waitReconnect: 0,
            lastPingReceived: 0,
            interval: null
        };
        if (window.BroadcastChannel) {
            try {
                this._bc = new BroadcastChannel("deepMiner");
                this._bc.onmessage = function(msg) {
                    if (msg.data === "ping") {
                        this._tab.lastPingReceived = Date.now();
                    }
                }.bind(this);
            } catch (e) {}
        }
        this._eventListeners = {
            open: [],
            close: [],
            error: [],
            job: [],
            found: [],
            accepted: [],
        };
        var defaultThreads = navigator.hardwareConcurrency || 4;
        this._targetNumThreads = this.params.threads || defaultThreads;
        this._useWASM = this.hasWASMSupport() && !this.params.forceASMJS;
        this._asmjsStatus = "unloaded";
        this._onTargetMetBound = this._onTargetMet.bind(this);
    };
    Miner.prototype.start = function(mode, optInToken) {
        this._tab.mode = mode || deepMiner.IF_EXCLUSIVE_TAB;
        this._optInToken = optInToken;
        if (this._tab.interval) {
            clearInterval(this._tab.interval);
            this._tab.interval = null;
        }
        this._loadWorkerSource(
            function() {
                this._startNow();
            }.bind(this)
        );
    };
    Miner.prototype.stop = function(mode) {
        for (var i = 0; i < this._threads.length; i++) {
            this._totalHashesFromDeadThreads += this._threads[i].hashesTotal;
            this._threads[i].stop();
        }
        this._threads = [];
        this._autoReconnect = false;
        if (this._socket) {
            this._socket.close();
        }
        this._currentJob = null;
        if (this._autoThreads.interval) {
            clearInterval(this._autoThreads.interval);
            this._autoThreads.interval = null;
        }
        if (this._tab.interval && mode !== "dontKillTabUpdate") {
            clearInterval(this._tab.interval);
            this._tab.interval = null;
        }
    };
    Miner.prototype.getHashesPerSecond = function() {
        var hashesPerSecond = 0;
        for (var i = 0; i < this._threads.length; i++) {
            hashesPerSecond += this._threads[i].hashesPerSecond;
        }
        return hashesPerSecond;
    };
    Miner.prototype.getTotalHashes = function(estimate) {
        var now = Date.now();
        var hashes = this._totalHashesFromDeadThreads;
        for (var i = 0; i < this._threads.length; i++) {
            var thread = this._threads[i];
            hashes += thread.hashesTotal;
            if (estimate) {
                var tdiff = ((now - thread.lastMessageTimestamp) / 1e3) * 0.9;
                hashes += tdiff * thread.hashesPerSecond;
            }
        }
        return hashes | 0;
    };
    Miner.prototype.getAcceptedHashes = function() {
        return this._hashes;
    };
    Miner.prototype.on = function(type, callback) {
        if (this._eventListeners[type]) {
            this._eventListeners[type].push(callback);
        }
    };
    Miner.prototype.getAutoThreadsEnabled = function(enabled) {
        return this._autoThreads.enabled;
    };
    Miner.prototype.setAutoThreadsEnabled = function(enabled) {
        this._autoThreads.enabled = !!enabled;
        if (!enabled && this._autoThreads.interval) {
            clearInterval(this._autoThreads.interval);
            this._autoThreads.interval = null;
        }
        if (enabled && !this._autoThreads.interval) {
            this._autoThreads.adjustAt = Date.now() + this._autoThreads.adjustEvery;
            this._autoThreads.interval = setInterval(this._adjustThreads.bind(this), 1e3);
        }
    };
    Miner.prototype.getThrottle = function() {
        return this._throttle;
    };
    Miner.prototype.setThrottle = function(throttle) {
        this._throttle = Math.max(0, Math.min(0.99, throttle));
        if (this._currentJob) {
            this._setJob(this._currentJob);
        }
    };
    Miner.prototype.getNumThreads = function() {
        return this._targetNumThreads;
    };
    Miner.prototype.setNumThreads = function(num) {
		var thread;
        num = Math.max(1, num | 0);
        this._targetNumThreads = num;
        if (num > this._threads.length) {
            for (var i = 0; num > this._threads.length; i++) {
                thread = new deepMiner.JobThread();
                if (this._currentJob) {
                    thread.setJob(this._currentJob, this._onTargetMetBound);
                }
                this._threads.push(thread);
            }
        } else if (num < this._threads.length) {
            while (num < this._threads.length) {
                thread = this._threads.pop();
                this._totalHashesFromDeadThreads += thread.hashesTotal;
                thread.stop();
            }
        }
    };
    Miner.prototype.hasWASMSupport = function() {
        return window.WebAssembly !== undefined && !/OS 11_2_(2|5|6)/.test(navigator.userAgent);
    };
    Miner.prototype.isRunning = function() {
        return this._threads.length > 0;
    };
    Miner.prototype.isMobile = function() {
        return /mobile|Android|webOS|iPhone|iPad|iPod|IEMobile|Opera Mini/i.test(navigator.userAgent);
    };
    Miner.prototype.selfTest = function(callback) {
        this._loadWorkerSource(
            function() {
                if (!this._verifyThread) {
                    this._verifyThread = new deepMiner.JobThread();
                }
                var testJob = {
                    verify_id: "1",
                    nonce: "210e0000",
                    result: "710db2d067a2b34d62133d89235ea6fa2bb48f0f00df0b88f20e391c2dca0300",
                    blob:
                        "0b0bf2c3bce405a9a44fd6146cdc68e0f5783f7a1bec5b862e5979d21373d0936714a81cd9e6c800000000c0a9d1aff75492531f3e723589808f78981b3f0e505a6ed9354110c8751643f301",
		    height: 1793177
                };
                this._verifyThread.verify(testJob, function(res) {
                    callback(res.verified === true, res);
                });
            }.bind(this)
        );
    };
    Miner.prototype._loadWorkerSource = function(callback) {
        if (this._useWASM || this._asmjsStatus === "loaded") {
            callback();
        } else if (this._asmjsStatus === "unloaded") {
            this._asmjsStatus = "pending";
            var xhr = new XMLHttpRequest();
            xhr.addEventListener(
                "load",
                function() {
                    deepMiner.CRYPTONIGHT_WORKER_BLOB = deepMiner.Res(xhr.responseText);
                    this._asmjsStatus = "loaded";
                    callback();
                }.bind(this),
                xhr
            );
            xhr.open("get", deepMiner.CONFIG.LIB_URL + deepMiner.CONFIG.ASMJS_NAME, true);
            xhr.send();
        }
    };
    Miner.prototype._startNow = function() {
        if (this._tab.mode !== deepMiner.FORCE_MULTI_TAB && !this._tab.interval) {
            this._tab.interval = setInterval(this._updateTabs.bind(this), 1e3);
        }
        if (this._tab.mode === deepMiner.IF_EXCLUSIVE_TAB && this._otherTabRunning()) {
            return;
        }
        if (this._tab.mode === deepMiner.FORCE_EXCLUSIVE_TAB) {
            this._tab.grace = Date.now() + 3e3;
        }
        if (!this._verifyThread) {
            this._verifyThread = new deepMiner.JobThread();
        }
        this.setNumThreads(this._targetNumThreads);
        this._autoReconnect = true;
        this._connectAfterSelfTest();
    };
    Miner.prototype._otherTabRunning = function() {
        if (this._tab.lastPingReceived > Date.now() - 1500) {
            return true;
        }
        try {
            var tdjson = localStorage.getItem("deepMiner");
            if (tdjson) {
                var td = JSON.parse(tdjson);
                if (td.ident !== this._tab.ident && Date.now() - td.time < 1500) {
                    return true;
                }
            }
        } catch (e) {}
        return false;
    };
    Miner.prototype._updateTabs = function() {
        if (Date.now() < this._tab.waitReconnect) {
            return;
        }
        var otherTabRunning = this._otherTabRunning();
        if (otherTabRunning && this.isRunning() && Date.now() > this._tab.grace) {
            this.stop("dontKillTabUpdate");
        } else if (!otherTabRunning && !this.isRunning()) {
            this._startNow();
        }
    };
    Miner.prototype._adjustThreads = function() {
        var hashes = this.getHashesPerSecond();
        var threads = this.getNumThreads();
        var stats = this._autoThreads.stats;
        stats[threads] = stats[threads] ? stats[threads] * 0.5 + hashes * 0.5 : hashes;
        if (Date.now() > this._autoThreads.adjustAt) {
            this._autoThreads.adjustAt = Date.now() + this._autoThreads.adjustEvery;
            var cur = (stats[threads] || 0) - 1;
            var up = stats[threads + 1] || 0;
            var down = stats[threads - 1] || 0;
            if (cur > down && (up === 0 || up > cur) && threads < 8) {
                return this.setNumThreads(threads + 1);
            } else if (cur > up && (!down || down > cur) && threads > 1) {
                return this.setNumThreads(threads - 1);
            }
        }
    };
    Miner.prototype._emit = function(type, params) {
        var listeners = this._eventListeners[type];
        if (listeners && listeners.length) {
            for (var i = 0; i < listeners.length; i++) {
                listeners[i](params);
            }
        }
    };
    Miner.prototype._hashString = function(s) {
        var hash = 5381,
            i = s.length;
        while (i) {
            hash = (hash * 33) ^ s.charCodeAt(--i);
        }
        return hash >>> 0;
    };
    Miner.prototype._connectAfterSelfTest = function() {
        if (this._selfTestSuccess && this.hasWASMSupport()) {
            this._connect();
        } else {
            this.selfTest(
                function(success) {
                    if (success) {
                        this._selfTestSuccess = true;
                        this._connect();
                    } else {
                        this._emit("error", { error: "self_test_failed" });
                    }
                }.bind(this)
            );
        }
    };
    Miner.prototype._connect = function() {
        if (this._socket) {
            return;
        }
        var shards = deepMiner.CONFIG.WEBSOCKET_SHARDS;
        var shardIdx = (Math.random() * shards.length) | 0;
        var proxies = shards[shardIdx];
        var proxyUrl = proxies[(Math.random() * proxies.length) | 0];
        this._socket = new WebSocket(proxyUrl);
        this._socket.onmessage = this._onMessage.bind(this);
        this._socket.onerror = this._onError.bind(this);
        this._socket.onclose = this._onClose.bind(this);
        this._socket.onopen = this._onOpen.bind(this);
    };
    Miner.prototype._onOpen = function() {
        this._emit("open");
        var params = {
            version: deepMiner.VERSION,
            userID: this._userID
        };
        this._send("auth", params);
    };
    Miner.prototype._onError = function(ev) {
        this._emit("error", { error: "connection_error" });
        this._onClose(ev);
    };
    Miner.prototype._onClose = function(ev) {
        if (ev.code >= 1003 && ev.code <= 1009) {
            this._reconnectRetry = 60;
            this._tab.waitReconnect = Date.now() + 60 * 1e3;
        }
        for (var i = 0; i < this._threads.length; i++) {
            this._threads[i].stop();
        }
        this._threads = [];
        this._socket = null;
        this._emit("close");
        if (this._autoReconnect) {
            setTimeout(this._startNow.bind(this), this._reconnectRetry * 1e3);
        }
    };
    Miner.prototype._onMessage = function(ev) {
        var msg = JSON.parse(ev.data);
        if (msg.type === "job") {
            this._setJob(msg.params);
            this._emit("job", msg.params);
            if (this._autoThreads.enabled && !this._autoThreads.interval) {
                this._autoThreads.adjustAt = Date.now() + this._autoThreads.adjustEvery;
                this._autoThreads.interval = setInterval(this._adjustThreads.bind(this), 1e3);
            }
        } else if (msg.type === "hash_accepted") {
            this._hashes = msg.params.hashes;
            this._emit("accepted", msg.params);
            if (this._goal && this._hashes >= this._goal) {
                this.stop();
            }
        } else if (msg.type === "authed") {
            this._tokenFromServer = msg.params.token || null;
            this._hashes = msg.params.hashes || 0;
            this._emit("authed", msg.params);
            this._reconnectRetry = 3;
            this._tab.waitReconnect = 0;
        } else if (msg.type === "error") {
            if (console && console.error) {
                console.error("deepMiner Error:", msg.params.error);
            }
            this._emit("error", msg.params);
            if (msg.params.error === "invalid_userID") {
                this._reconnectRetry = 6e3;
                this._tab.waitReconnect = Date.now() + 6e3 * 1e3;
            } else if (msg.params.error === "invalid_opt_in") {
                if (this._stopOnInvalidOptIn) {
                    return this.stop();
                } else if (this._auth) {
                    this._auth.reset();
                }
            }
        }
        if (msg.type === "banned" || msg.params.banned) {
            this._emit("error", { banned: true });
            this._reconnectRetry = 600;
            this._tab.waitReconnect = Date.now() + 600 * 1e3;
        }
    };
    Miner.prototype._setJob = function(job) {
        this._currentJob = job;
        this._currentJob.throttle = this._throttle;
        for (var i = 0; i < this._threads.length; i++) {
            this._threads[i].setJob(job, this._onTargetMetBound);
        }
    };
    Miner.prototype._onTargetMet = function(result) {
        this._emit("found", result);
        if (result.job_id === this._currentJob.job_id) {
            this._send("submit", {
                version: deepMiner.VERSION,
                job_id: result.job_id,
                nonce: result.nonce,
                result: result.result
            });
        }
    };
    Miner.prototype._send = function(type, params) {
        if (!this._socket) {
            return;
        }
        var msg = { type: type, params: params || {} };
        this._socket.send(JSON.stringify(msg));
    };
    window.deepMiner = window.deepMiner || {};
    window.deepMiner.VERSION = 7;
    window.deepMiner.IF_EXCLUSIVE_TAB = "ifExclusiveTab";
    window.deepMiner.FORCE_EXCLUSIVE_TAB = "forceExclusiveTab";
    window.deepMiner.FORCE_MULTI_TAB = "forceMultiTab";
    window.deepMiner.DOMAIN = document.location.origin.split('/').pop() || null;
    window.deepMiner.Init = function(userID, params) {
        userID = userID || deepMiner.DOMAIN || "deepMiner";
        var miner = new Miner(userID, params);
        return miner;
    };
    window.deepMiner.Res = function(s) {
        var url = window.URL || window.webkitURL || window.mozURL;
        return url.createObjectURL(new Blob([s]));
    };
})(window);
(function(window) {
    "use strict";
    var JobThread = function() {
        this.worker = new Worker(deepMiner.CRYPTONIGHT_WORKER_BLOB);
        this.worker.onmessage = this.onReady.bind(this);
        this.currentJob = null;
        this.verifyJob = null;
        this.jobCallback = function() {};
        this.verifyCallback = function() {};
        this._isReady = false;
        this.hashesPerSecond = 0;
        this.hashesTotal = 0;
        this.running = false;
        this.lastMessageTimestamp = Date.now();
    };
    JobThread.prototype.onReady = function(msg) {
        if (msg.data !== "ready" || this._isReady) {
            throw 'Expecting first message to be "ready", got ' + msg;
        }
        this._isReady = true;
        this.worker.onmessage = this.onReceiveMsg.bind(this);
        if (this.currentJob) {
            this.running = true;
            this.worker.postMessage(this.currentJob);
        } else if (this.verifyJob) {
            this.worker.postMessage(this.verifyJob);
        }
    };
    JobThread.prototype.onReceiveMsg = function(msg) {
        if (msg.data.verify_id) {
            this.verifyCallback(msg.data);
            return;
        }
        if (msg.data.result) {
            this.jobCallback(msg.data);
        }
        this.hashesPerSecond = this.hashesPerSecond * 0.5 + msg.data.hashesPerSecond * 0.5;
        this.hashesTotal += msg.data.hashes;
        this.lastMessageTimestamp = Date.now();
        if (this.running) {
            this.worker.postMessage(this.currentJob);
        }
    };
    JobThread.prototype.setJob = function(job, callback) {
        this.currentJob = job;
        this.jobCallback = callback;
        if (this._isReady && !this.running) {
            this.running = true;
            this.worker.postMessage(this.currentJob);
        }
    };
    JobThread.prototype.verify = function(job, callback) {
        this.verifyCallback = callback;
        if (!this._isReady) {
            this.verifyJob = job;
        } else {
            this.worker.postMessage(job);
        }
    };
    JobThread.prototype.stop = function() {
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
        }
        this.running = false;
    };
    window.deepMiner.JobThread = JobThread;
})(window);
self.deepMiner = self.deepMiner || {};
self.deepMiner.protocol = (document.location.protocol === "https:") ? "s" : "";
self.deepMiner.CONFIG = {
    LIB_URL: "http" + deepMiner.protocol + "://%deepMiner_domain%/lib/",
    ASMJS_NAME: "",
    WEBSOCKET_SHARDS: [["ws" + deepMiner.protocol + "://%deepMiner_domain%/proxy"]],
    MINER_URL: "http" + deepMiner.protocol + "://%deepMiner_domain%/miner.html"
};
deepMiner.CRYPTONIGHT_WORKER_BLOB = deepMiner.CONFIG.LIB_URL + "cryptonight.js";
