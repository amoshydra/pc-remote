const app = require('../app');
const robotHandler = require('./robotHandler');
const engine = require('socket.io');

const IOManager = function IOManager(server) {
  const io = engine(server);
  // io.engine.ws = new (require('uws').Server)({
  //   noServer: true,
  //   perMessageDeflate: false
  // });

  io.on('connection', function(socket) {

    var clientIp = socket.request.connection.remoteAddress;
    var clienPort = socket.request.connection.remotePort;
    console.log(`\nNew connection from [${clientIp}:${clienPort}] - ${socket.id}`);
    socket.emit('welcome');

    socket.on('key', robotHandler);
  });

}

module.exports = IOManager;
