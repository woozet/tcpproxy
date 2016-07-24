'use strict'

const net = require('net');
const loadFiles = require('./loadFiles');
const config = loadFiles('./config');
const portmap = config[0].json.portmap;
const middleware = require('./lib/middleware');
const compose = require('koa-compose');
let mapInfo = new Map();
let servers = new Map();
let connectionCount = 0;

for (let key in portmap) {
    let port = portmap[key].port;
    let target = portmap[key].target;

    servers.set(key, net.createServer(forwardProxy(target)).listen(port));
    mapInfo.set(key, portmap[key]);
    console.log("TCP server accepting connection on port:", port);
}

function forwardProxy({host, port}) {
    let middlewares = middleware();

    middlewares.add();      // add argama middlewares

    return socket => {
        socket.on('end', () => {
            connectionCount--;
            console.log('connection ended', connectionCount);
        });
        socket.on('error', err => {
            socket.end();
        });

        middlewares.getCompositioned().call(this).then(() => {     // it is respond
            console.log('connection established', connectionCount);

            // flow the data
            socket.on('data', msg => {
                console.log('  ** START **');
                console.log('<< From client to proxy ', msg.toString());
                var serviceSocket = new net.Socket();

                serviceSocket.on("data", data => {
                    console.log('<< From remote to proxy', data.toString());
                    socket.write(data);
                    console.log('>> From proxy to client', data.toString());
                });
                serviceSocket.on('error', err => {
                    socket.end();
                });

                serviceSocket.connect(parseInt(port), host, function () {
                    console.log('>> From proxy to remote', msg.toString());
                    serviceSocket.write(msg);
                });
            });
        }).catch(() => {
            socket.end();
        });
    };
}

process.on('uncaughtException', function (err) {
    // console.log(this);
    console.error('uncaughtException!!! [' + err + ']');
});
