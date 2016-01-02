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

var sockets = {};
var requests = {};
var matches = [];

io.on('connection', function (socket) {
    socket.data = {};
    socket.data.lobby = false;
    socket.data.match = null;

    sockets[socket.id] = socket; //construim un obiect cu toate socketurile

    socket.emit("socketId", socket.id);


    socket.on("join", function (name) {
        /* send current players */
        socket.data.name = name;
        joinLobby(socket);
    });

    socket.on("request", function (playerId) {
        sockets[playerId].emit("request", socket.data.name);
        requests[playerId] = socket.id;
    });

    socket.on("accept", function () {
        var socket1 = socket;
        var socket2 = sockets[requests[socket.id]];

        var players = [socket1.id, socket2.id];
        delete requests[socket.id];

        /* cand un meci s-a accept intre doi playeri, ii scoatem din lobby pe amandoi */
        leaveLobby(socket1);
        leaveLobby(socket2);

        var array1 = [];
        for (var i = 0; i < 24; i++) {
            array1[i] = i;
        }

        array1.sort(function () {
            return .5 - Math.random();
        });

        var array2 = array1.splice(0, 12);
        var randomArray = [array1, array2];

        socket1.emit("start", {player: 0, array: randomArray});
        socket2.emit("start", {player: 1, array: randomArray});

        var match = {
            sockets: [socket1, socket2],
            randomArray: randomArray
        };

        matches.push(match);
        socket1.data.match = match;
        socket2.data.match = match;
    });

    socket.on("stop", function () {
        stopMatch(socket);
    });

    function stopMatch(socket) {
        if (socket.data.match === null) {
            return;
        }

        var matchIndex = matches.indexOf(socket.data.match);

        if (matchIndex === -1) {
            return;
        }

        var match = matches[matchIndex];
        var players = match.sockets;

        players[0].data.match = null;
        players[1].data.match = null;

        players[0].emit("stop");
        joinLobby(players[0]);

        players[1].emit("stop");
        joinLobby(players[1]);

        delete matches[matchIndex];
    }

    socket.on("disconnect", function () {
        if (socket.data.match !== null) {
            stopMatch(socket);
        }

        if (socket.data.lobby === true) {
            io.to("lobby").emit("removeLobbyPlayer", socket.id);
        }

        delete sockets[socket.id]; //stergem cand se deconecteaza
    });
});

function joinLobby(socket) {
    if (socket.data.lobby === false) {
        socket.emit("clearLobby");

        var currentLobbyPlayers = [];
        for (var i in sockets) {
            if (sockets[i].data.lobby === true) {
                socket.emit("addLobbyPlayer", {id: sockets[i].id, name: sockets[i].data.name});
            }
        }

        socket.join("lobby");
        socket.data.lobby = true;
        io.to("lobby").emit("addLobbyPlayer", {id: socket.id, name: socket.data.name});
    }
}

function leaveLobby(socket) {
    if (socket.data.lobby === true) {
        socket.leave("lobby");
        socket.data.lobby = false;
        io.to("lobby").emit("removeLobbyPlayer", socket.id);
    }
}