var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

io.set('transports', ['xhr-polling']);
io.set('polling duration', 10);

app.use(express.static('public'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

const minimumClients = 2;

let clients = [];

io.on('connection', connectionCallback);

function onClientReady(socket) {
  console.log(socket.id, ' is ready!');
  if (clients.length < minimumClients) {
    console.log('\nWaiting for ', minimumClients - clients.length, ' more!');
    socket.emit('welcome');
    return;
  }

  socket.broadcast.emit('client ready');
  // console.log('3');
  // setTimeout(() => {
  //   console.log('2');
  //   setTimeout(() => {
  //     console.log('1');
  //     setTimeout(() => {
  //       console.log('starting!');
  //       io.emit('start');
  //     }, 1000)
  //   }, 1000)
  // }, 1000)
}

function requestedPlay(socket) {
  socket.emit('play');
  console.log('someone requested play')
}

function requestedPause(socket) {
  socket.emit('pause');
  console.log('someone requested pause')
}


function onFileInputReady(socket) {
  socket.emit('file input ready');
  console.log('file input ready for one client')
}

function fileLoaded(socket) {
  socket.emit('file loaded');
  console.log('file ready for one client')
}

function accept(socket) {
  socket.emit('accept');
  console.log('one client accepted')
}

function printAllClients() {
  console.log('\n\n====================\nClients:\n');
  clients.forEach((element) => {
    console.log('\t', element.id);
  });
  console.log('====================');
}

function connectionCallback(socket) {
  console.log('user with id:', socket.id);
  clients.push({socket: socket});
  printAllClients();
  socket.on('client ready', () => {
    onClientReady(socket)
  });
  socket.on('file input ready', () => {
    onFileInputReady(socket)
  });
  // socket.on('open vlc',()=>{console.log(socket)})
  socket.on('accept', () => {
    accept(socket)
  });
  socket.on('file loaded', () => {
    fileLoaded(socket)
  });
  socket.on('request pause', () => {
    requestedPause(socket)
  });
  socket.on('request play', () => {
    requestedPlay(socket)
  });
}


http.listen(3000, function () {
  console.log('listening on *:3000');
});