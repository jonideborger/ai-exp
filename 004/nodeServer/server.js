const textToSpeech = require('@google-cloud/text-to-speech');
const config = require("./config.json");

//SET-UP some GLOBALS
const socketPort = config.socketPort || 124;

const io = require('socket.io')(socketPort);

let s = {
    connectionCounter: 0,
}

const speechClient = new textToSpeech.TextToSpeechClient();

/**************
* SOCKET Events
**************/

io.set('origins', '*:*');
io.on('connection', (socket) => {
  s.connectionCounter++;
  console.log(`sockets connected: ${s.connectionCounter}`);

  socket.emit('/init', s);

  socket.on('disconnect', () => {
    s.connectionCounter--;
    console.log(`sockets connected: ${s.connectionCounter}`);
  });

  //Custom SOCKET receive events
  socket.on('/client/customEvent', (data) => {
    console.log('my custom event received', data);
    io.emit('/updateTimeTotal', s.timeTotal);
  });

});

console.log("Socket Server listening on port:", socketPort)
