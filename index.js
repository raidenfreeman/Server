var express = require('express');
var app = express();

const PORT = process.env.PORT || 3000;

var http = require('http').Server(app);

http.listen(PORT, function () {
  console.log('listening on *:', PORT);
});

var io = require('socket.io')(http);

app.use(express.static('public'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

const minimumClients = 2;

let clients = [];

io.on('connection', connectionCallback);

function onClientReady(socket) {
  // console.log(socket.id, ' is ready!');
  // if (clients.length < minimumClients) {
  //   console.log('\nWaiting for ', minimumClients - clients.length, ' more!');
  //   return;
  // }
  clients.filter((x)=>x.id === socket.id)[0].isReady = true;
  if(clients.every((x)=>x.isReady)) {
    socket.broadcast.emit('everyone ready');
  }
}

function requestedPlay(socket) {
  io.emit('play'); // tell everyone to play
  console.log('someone requested play')
}

function requestedPause(socket) {
  io.emit('pause'); // tell everyone to pause
  console.log('someone requested pause')
}

function fileLoaded(socket, file) {
  socket.broadcast.emit('file loaded', file);
  console.log('file ready for one client')
}

function accept(socket) {
  io.emit('accept');
  console.log('one client accepted')
}

function printAllClients() {
  console.log('\n\n====================\nClients:\n');
  clients.forEach((element) => {
    console.log('\t', element.socket.id);
  });
  console.log('====================');
}

function connectionCallback(socket) {
  console.log('user with id:', socket.id);
  clients.push({socket: socket});
  printAllClients();
  console.log('\n\nSending welcome');
  socket.emit('welcome');
  socket.broadcast.emit('welcome');

  socket.on('disconnect', () => {
    clients = clients.filter((x) => x.id !== socket.id)
  });

  socket.on('client ready', () => {
    //vlc is open and file is loaded
    onClientReady(socket)
  });

  // socket.on('open vlc',()=>{console.log(socket)})
  socket.on('accept', () => {
    //client accepts the current files from the other clients
    accept(socket)
  });

  socket.on('file loaded', (file) => {
    fileLoaded(socket, file)
  });

  socket.on('request pause', () => {
    requestedPause(socket)
  });

  socket.on('request play', () => {
    requestedPlay(socket)
  });
}
