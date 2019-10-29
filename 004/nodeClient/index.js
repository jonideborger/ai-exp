var osc = require("osc");
var config = require('./config.js')();
var io = require('socket.io-client');
var socket = io.connect(config.serverAddress);

console.log(socket)
/**
 * Init the open sound control connection
 */
var udpPort = new osc.UDPPort({
    localAddress: config.address,
    localPort: config.inputPort,
    remoteAddress: config.address,
    remotePort: config.outputPort
});

/**
 * Open up the UDP port
 */
udpPort.open();

/**
 * Handle incoming OSC messages by sending them over SOCKET.IO/websocket to the server
 */
udpPort.on("message", function (oscMessage) {

  console.log("Received OSC Message ", oscMessage);

  if(oscMessage.address == '/myString') {
    console.log(`Received ${oscMessage.address} event with values: ${oscMessage.args[0]}`);
    socket.emit(oscMessage.address, oscMessage.args[0]);
    //socket.emit(oscMessage.address, oscMessage.args[0]);

  }
});



/**
 * Thanks the the initAllEvents function we can map all incoming SOCKET.IO/websocket messages
 * || maps them to OSC
 */
socket.on("connect", function(event, data) {
  console.log('Connected', event, data);
});

socket.on("*",function(event, data) {
    var msg = {
        address: "/"+event.description,
        args: data.__v
    };
    console.log("Sending OSC message", msg.address, msg.args, "to", udpPort.options.remoteAddress + ":" + udpPort.options.remotePort);
    udpPort.send(msg);
});
