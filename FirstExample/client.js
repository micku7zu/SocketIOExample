"use strict";

var mesaje = document.getElementById("info");
var player1 = document.getElementById("player1");
var player2 = document.getElementById("player2");

var socket = io('http://localhost');
var playerNumber = 2;

socket.on("wait", function (data) {
    playerNumber = 1; //daca primeste wait inseamna ca e primul jucator, daca nu, inseamna ca e al doilea jucator
    mesaje.innerHTML = "Trebuie sa astepti. Esti primul jucator";
});

socket.on("start", function (data) {
    mesaje.innerHTML = "Jocul a inceput!";

    var myArray = data.randomArrays[(playerNumber + 1) % 2];
    var enemyArray = data.randomArrays[playerNumber % 2];

    player1.innerHTML = myArray.join(" | ");
    player2.innerHTML = enemyArray.join(" | ");
});

socket.on("stop", function (data) {
    mesaje.innerHTML = "A plecat jucatorul...";

    player1.innerHTML = "";
    player2.innerHTML = "";
});

socket.on("full", function (data) {
    mesaje.innerHTML = "Sunt prea multi jucatori :( incearca mai tarziu!";
});