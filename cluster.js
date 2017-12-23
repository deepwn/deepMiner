 /*
 Support for multiple processors (best performance)
 by vphelipe
 */

var cluster = require('cluster');
var numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
    for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
    cluster.on('exit', function(deadWorker, code, signal) {
        // On exit, restart process.
        var worker = cluster.fork();
        var newPID = worker.process.pid;
    });
} else {
    require("./server.js");
}
