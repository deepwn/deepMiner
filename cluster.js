 /*
 Support for multiple processors (best performance)
 by vphelipe
 */

var cluster = require('cluster');
var numCPUs = require('os').cpus().length;
var fs = require('fs');
var banner = fs.readFileSync(__dirname + '/banner', 'utf8');
var conf = JSON.parse(fs.readFileSync(__dirname + '/config.json', 'utf8'));

if (cluster.isMaster) {
    console.log(banner);
    console.log(' Listen on : ' + conf.lhost + ':' + conf.lport + '\n Pool Host : ' + conf.pool + '\n Ur Wallet : ' + conf.addr + '\n');
    console.log('----------------------------------------------------------------------------------------\n');
    console.log(`[!] Daemon start. PID: ${process.pid}\n`);
    for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
    };
    cluster.on('exit', function(deadWorker, code, signal) {
        // On exit, restart process.
        var worker = cluster.fork();
        var newPID = worker.process.pid;
        console.log(`[i] Subprocess restart. PID: ${process.pid}\n`);
    });
} else {
    require("./server.js");
    console.log(`[i] Subprocess start. PID: ${process.pid}\n`);
}