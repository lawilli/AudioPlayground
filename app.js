'use strict';
var express = require('express');
var app = new express();
var port = process.env.PORT || 3000;
var http = require('http').Server(app);
var io = require('socket.io')(http);

var Log = require('log');
var log = new Log('debug');


app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/node_modules'));
app.use(express.static(__dirname + '/bower_components'));

app.get('/', function(req, res){
    res.redirect('index.html');
});

app.get('/listener', function(req, res){
    res.redirect('listener/index.html');
});

io.on('connection', function(client) {
    client.on('broad', function(note) {
        console.log(note);
        client.broadcast.emit('stream', note);
    });

    //client.on('stream', function() {
    //
    //});
});

http.listen(port, function() {
    log.info('Server is listening on port %s', port);
});

//'use strict';
//var express = require('express');
//var app = new express();
//var http = require('http').Server(app);
//var io = require('socket.io')(http);
//
//var Log = require('log');
//var log = new Log('debug');
//
//var port = process.env.PORT || 3000;
//
//app.use(express.static(__dirname + '/public'));
//app.use(express.static(__dirname + '/node_modules'));
//app.use(express.static(__dirname + '/bower_components'));
//
//app.get('/', function(req, res){
//    res.redirect('index.html');
//});
//
//io.on('connection', function(socket) {
//    socket.on('stream', function(image) {
//        socket.broadcast.emit('stream', image);
//    });
//});
//
//http.listen(port, function() {
//    log.info('Server is listening on port %s', port);
//});