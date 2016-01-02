"use strict";
var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');

app.listen(80);

function handler(req, res) {
    //serverul acesta http este doar pentru exemplu, trebuie sa serveasca doar client.js si index.html
    //poti sa folosesti orice alt server http, de exemplu apache, express sau ce vrei tu

    var file = (req.url.indexOf("client.js") > -1) ? "client.js" : "index.html";

    //ok, acum serveste fisierele corect

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

//aici avem serverul nostru socket.io

//din postarea ta eu am inteles urmatorul flow:
//se conecteaza 1 client si asteapta pana ce se conecteaza al doilea
//se conecteaza al doilae client si se amesteca un array de 24 de elemente si se trimite la clienti
//hai sa facem acest lucru

var array = [];
for (var i = 0; i < 24; i++) {
    array[i] = i;
}
//avem arrayul de 24 de elemente, 0, 1, 2, ... 22, 23
//console.log("Array:", array);

//trebuie sa stim in fiecare moment cati playeri avem conectati
var players = 0;


io.on('connection', function (socket) {

    players++; //cand cineva se conecteaza, crestem contorul
    console.log("S-a conectat un client nou, avem " + players + " numar de jucatori.");
    //aceasta functie se apeleaza cand se conecteaza un client la server
    //vedem ca la fiecare conecxiune noua, contorul creste, acum trebuie sa-l facem sa si scada

    //socket este un obiect mult prea mare ca sa ne putem da seama ce se intampla acolo in consola
    //asa ca printam idul unic generat de socket.io pentru fiecare client
    //dupa cum poti vedea, pentru fiecare client nou, se printeaza datele de care avem nevoie
    //console.log("Client nou:", socket.id);

    socket.on('disconnect', function () {
        //daca unul din cei doi care sunt in joc pleaca, trebuie sa anuntam
        if(socket.player === true) {
            console.log("stop");
            io.sockets.emit("stop");
        }

        players--;
        console.log("S-a deconectat un jucator, avem " + players + " numar de jucatori.");

    });

    //perfect, avem contorul de playeri care functioneaza
    //acum treubie sa tratam flowul

    //daca se conecteaza 1 jucator si el este primul, ii spnem ca trebuie sa astepte
    if (players === 1) {
        //ii trimitem wait la primul jucator care intra
        socket.emit("wait");
        socket.emit("player", 1);

        socket.player = true; //ne setam ca este un player, nu un socket care s-a conectat dupa ce aveam cei doi playeri
    } else if (players === 2) {
        socket.player = true;
        socket.emit("player", 2); //fiecare dintre ei treubie sa stie ce player 1, player1 sau player 2
        //daca este al doilea jucator, putem incepe jocul\
        //le trimitem la ambii jucatori START si un set de date, in cazul acesta un obiect gol momentan
        //aici trimitem la TOTI (adica la cei doi)

        //sa amestecam arrayul si sa-l trimitem
        //am luat ceva random rapid

        var array1 = array.slice();
        array1.sort(function() {
            return .5 - Math.random();
        });

        var array2 = array1.splice(0, 12);

        console.log("Player1: " + array1);
        console.log("Player2: " + array2);

        io.sockets.emit("start", {
            randomArrays: [array1, array2]
        });
    } else {
        //la oricine se conecteaza dupa acei doi jucatori le trimitem ca e full
        //daca sunt mai multi playeri, din pacate ii scoatem afara
        socket.player = false;
        socket.emit("full");
    }

});