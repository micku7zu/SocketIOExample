"use strict";
var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');

app.listen(80);

function handler(req, res) {
    var file = (req.url.indexOf("client.js") > -1) ? "client.js" : "index.html";

    fs.readFile(__dirname + '/' + file,
        function (err, data) {
            if (err) {
                res.writeHead(500);
                return res.end('Error loading index.html');
            }

            res.writeHead(200);
            res.end(data);
        });
}

var array = [];
for (var i = 0; i < 24; i++) {
    array[i] = i;
}

var players = 0;


io.on('connection', function (socket) {
    players++;

    socket.on('disconnect', function () {
        if(socket.player === true) {
            console.log("stop");
            io.sockets.emit("stop");
        }
        players--;
    });

    if (players === 1) {
        socket.emit("wait");
        socket.player = true;
    } else if (players === 2) {
        socket.player = true;
        
        var array1 = array.slice();
        array1.sort(function() {
            return .5 - Math.random();
        });

        var array2 = array1.splice(0, 12);

        io.sockets.emit("start", {
            randomArrays: [array1, array2]
        });
    } else {
        socket.player = false;
        socket.emit("full");
    }

});