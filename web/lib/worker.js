var CryptonightWASMWrapper = function() {
    (this.throttleWait = 0),
        (this.throttledStart = 0),
        (this.throttledHashes = 0),
        (this.workThrottledBound = this.workThrottled.bind(this)),
        (this.currentJob = null),
        (this.target = new Uint8Array([255, 255, 255, 255, 255, 255, 255, 255]));
    var e = Module.HEAPU8.buffer;
    (this.input = new Uint8Array(e, Module._malloc(84), 84)),
        (this.output = new Uint8Array(e, Module._malloc(32), 32)),
        self.postMessage("ready"),
        (self.onmessage = this.onMessage.bind(this));
};
(CryptonightWASMWrapper.prototype.onMessage = function(e) {
    var t = e.data;
    return t.verify_id
        ? void this.verify(t)
        : ((this.currentJob && this.currentJob.job_id === t.job_id) || this.setJob(t),
          void (t.throttle
              ? ((this.throttleWait = 1 / (1 - t.throttle) - 1),
                (this.throttledStart = this.now()),
                (this.throttledHashes = 0),
                this.workThrottled())
              : this.work()));
}),
    (CryptonightWASMWrapper.prototype.hexToBytes = function(e, t) {
        for (var t = new Uint8Array(e.length / 2), r = 0, n = 0; n < e.length; n += 2, r++)
            t[r] = parseInt(e.substr(n, 2), 16);
        return t;
    }),
    (CryptonightWASMWrapper.prototype.bytesToHex = function(e) {
        for (var t = "", r = 0; r < e.length; r++) (t += (e[r] >>> 4).toString(16)), (t += (15 & e[r]).toString(16));
        return t;
    }),
    (CryptonightWASMWrapper.prototype.meetsTarget = function(e, t) {
        for (var r = 0; r < t.length; r++) {
            var n = e.length - r - 1,
                o = t.length - r - 1;
            if (e[n] > t[o]) return !1;
            if (e[n] < t[o]) return !0;
        }
        return !1;
    }),
    (CryptonightWASMWrapper.prototype.setVersion = function(e) {
        7 === e ? (this.cryptonight_variant = 1) : (this.cryptonight_variant = 0);
    }),
    (CryptonightWASMWrapper.prototype.setJob = function(e) {
        (this.currentJob = e),
            (this.blob = this.hexToBytes(e.blob)),
            this.input.set(this.blob),
            this.setVersion(this.blob[0]);
        var t = this.hexToBytes(e.target);
        if (t.length <= 8) {
            for (var r = 0; r < t.length; r++) this.target[this.target.length - r - 1] = t[t.length - r - 1];
            for (var r = 0; r < this.target.length - t.length; r++) this.target[r] = 255;
        } else this.target = t;
    }),
    (CryptonightWASMWrapper.prototype.now = function() {
        return self.performance ? self.performance.now() : Date.now();
    }),
    (CryptonightWASMWrapper.prototype.hash = function(e, t, r) {
        var n = (4294967295 * Math.random() + 1) >>> 0;
        (this.input[39] = (4278190080 & n) >> 24),
            (this.input[40] = (16711680 & n) >> 16),
            (this.input[41] = (65280 & n) >> 8),
            (this.input[42] = (255 & n) >> 0),
            _cryptonight_hash(e.byteOffset, t.byteOffset, r, this.cryptonight_variant);
    }),
    (CryptonightWASMWrapper.prototype.verify = function(e) {
        (this.blob = this.hexToBytes(e.blob)), this.input.set(this.blob), this.setVersion(this.blob[0]);
        for (var t = 0, r = 0; r < e.nonce.length; r += 2, t++) this.input[39 + t] = parseInt(e.nonce.substr(r, 2), 16);
        _cryptonight_hash(this.input.byteOffset, this.output.byteOffset, this.blob.length, this.cryptonight_variant);
        var n = this.bytesToHex(this.output);
        self.postMessage({ verify_id: e.verify_id, verified: n === e.result, result: n });
    }),
    (CryptonightWASMWrapper.prototype.work = function() {
        var e = 0,
            t = !1,
            r = this.now(),
            n = 0;
        do
            this.hash(this.input, this.output, this.blob.length),
                e++,
                (t = this.meetsTarget(this.output, this.target)),
                (n = this.now() - r);
        while (!t && n < 1e3);
        var o = e / (n / 1e3);
        if (t) {
            var i = this.bytesToHex(this.input.subarray(39, 43)),
                a = this.bytesToHex(this.output);
            self.postMessage({ hashesPerSecond: o, hashes: e, job_id: this.currentJob.job_id, nonce: i, result: a });
        } else self.postMessage({ hashesPerSecond: o, hashes: e });
    }),
    (CryptonightWASMWrapper.prototype.workThrottled = function() {
        var e = this.now();
        this.hash(this.input, this.output, this.blob.length);
        var t = this.now(),
            r = t - e;
        this.throttledHashes++;
        var n = t - this.throttledStart,
            o = this.throttledHashes / (n / 1e3);
        if (this.meetsTarget(this.output, this.target)) {
            var i = this.bytesToHex(this.input.subarray(39, 43)),
                a = this.bytesToHex(this.output);
            self.postMessage({
                hashesPerSecond: o,
                hashes: this.throttledHashes,
                job_id: this.currentJob.job_id,
                nonce: i,
                result: a
            }),
                (this.throttledHashes = 0);
        } else if (n > 1e3)
            self.postMessage({ hashesPerSecond: o, hashes: this.throttledHashes }), (this.throttledHashes = 0);
        else {
            var s = Math.min(2e3, r * this.throttleWait);
            setTimeout(this.workThrottledBound, s);
        }
    }),
    (Module.onRuntimeInitialized = function() {
        new CryptonightWASMWrapper();
    });
