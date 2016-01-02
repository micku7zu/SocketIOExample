"use strict";

var name = "";
while (name.length <= 1) {
    name = prompt("Numele tau: ");
}

var socket = io('http://localhost');

var divs = {};
divs.lobby = document.getElementById("lobby");
divs.game = document.getElementById("game");
divs.players = document.getElementById("players");
divs.player1 = document.getElementById("player1");
divs.player2 = document.getElementById("player2");
divs.stop = document.getElementById("stop");

var player = {}; //me
player.name = name;

var lobbyPlayers = {};

socket.emit("join", name);

socket.on("socketId", function (socketId) {
    player.id = socketId;
});

socket.on("clearLobby", function () {
    lobbyPlayers = [];

    while (divs.players.firstChild) {
        divs.players.removeChild(divs.players.firstChild);
    }
});

socket.on("addLobbyPlayer", function (pl) {
    lobbyPlayers[pl.id] = pl;
    var p = document.createElement("p");
    p.id = pl.id;
    p.innerHTML = pl.name;
    p.data = pl;
    divs.players.appendChild(p);

    p.addEventListener("click", function () {
        if (p.data.id !== player.id) {
            socket.emit("request", p.data.id);
        }
    });
});

socket.on("request", function (playerName) {
    var confirmed = confirm("Accepti un meci cu " + playerName + "?");
    if (confirmed) {
        socket.emit("accept");
    }
});

socket.on("start", function (data) {
    console.log(data);
    var myArray = data.array[data.player % 2];
    var enemyArray = data.array[(data.player + 1) % 2];

    divs.player1.innerHTML = myArray.join(" | ");
    divs.player2.innerHTML = enemyArray.join(" | ");

    divs.lobby.classList.add("hide");
    divs.game.classList.remove("hide");
});

socket.on("stop", function (data) {
    divs.lobby.classList.remove("hide");
    divs.game.classList.add("hide");
});

divs.stop.addEventListener("click", function () {
    socket.emit("stop");
});

socket.on("removeLobbyPlayer", function (playerId) {
    var p = document.getElementById(playerId);
    p.parentElement.removeChild(p);
    delete lobbyPlayers[playerId];
});
