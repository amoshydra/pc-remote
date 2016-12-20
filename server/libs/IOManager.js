const app = require('../app');
const engine = require('socket.io');
const robot = require('robotjs');

const IOManager = function IOManager(server) {
  const io = engine(server);
  io.engine.ws = new (require('uws').Server)({
    noServer: true,
    perMessageDeflate: false
  });

  console.log('Socket.io is initialized');

  io.on('connection', function(socket) {
    console.log('client connected');

    socket.on('key', function(event, pos) {
      if (event === 'mousemove') {
        mouse = robot.getMousePos();
        robot.moveMouse(mouse.x + pos.pageX, mouse.y + pos.pageY);
      }

      if (event === 'mousedown') {
        robot.mouseClick();
      }

      if (event === 'mousedown2') {
        robot.mouseClick('left', true);
      }

    });
  });

}

module.exports = IOManager;
