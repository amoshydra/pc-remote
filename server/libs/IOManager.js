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

      if (event === 'navigatemove') {
        let angle = Math.atan2(pos.pageY, pos.pageX);
        angle = angle * 180 / Math.PI + 45;
        let quadrant = Math.floor(angle/90) % 4 + 1;

        switch (quadrant) {
          case 0: robot.keyTap("up"); break;
          case 1: robot.keyTap("right"); break;
          case 2: robot.keyTap("down"); break;
          case 3: robot.keyTap("left"); break;
          case -1: robot.keyTap("left"); break;
        }
      }

      if (event === 'navigateenter') {
        robot.keyTap("enter");
      }

    });
  });

}

module.exports = IOManager;
