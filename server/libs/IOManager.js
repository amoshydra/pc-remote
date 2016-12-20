const app = require('../app');
const engine = require('socket.io');

const IOManager = function IOManager(server) {
  const io = engine(server);
  io.engine.ws = new (require('uws').Server)({
    noServer: true,
    perMessageDeflate: false
  });

  console.log('Socket.io is initialized');

  io.on('connection', function(socket) {
    console.log('yeah');
    
    socket.on('key', function(event, pos) {
      console.log(event, pos);
    });
  });

}

module.exports = IOManager;
