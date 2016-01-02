"use strict";
//aici avem clientul nostru

var mesaje = document.getElementById("info");
var player1 = document.getElementById("player1");
var player2 = document.getElementById("player2");

var socket = io('http://localhost');
var playerNumber = 0;
//tratam toate cele 3 cazuri

//cazul 1, cand primeste mesajul "wait" si inseamna ca este primul jucator
socket.on("wait", function (data) {
    mesaje.innerHTML = "Trebuie sa astepti. Esti primul jucator";
});

socket.on("player", function (data) {
    playerNumber = data; //primim player number de la server, 1 sau 2
});

//cazul 2 cand sunt 2 jucatori si jocul a inceput
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

//cazul 3 cand pe server erau prea multi jucatori si nu mai avea loc
socket.on("full", function (data) {
    mesaje.innerHTML = "Sunt prea multi jucatori :( incearca mai tarziu!";
});

//sa testam sa vedem daca merge