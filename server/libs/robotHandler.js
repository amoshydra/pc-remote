const robot = require('robotjs');

var handlerFuncs = {
  mousemove: function(pos) {
    mouse = robot.getMousePos();
    robot.moveMouse(mouse.x + pos.pageX, mouse.y + pos.pageY);
  },

  mousedown: function() {
    robot.mouseClick();
  },

  mousedown2: function(pos) {
    robot.mouseClick('left', true);
  },

  navigatemove: function(pos) {
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
  },

  navigateenter: function() {
    robot.keyTap("enter");
  },

  scroll: function(pos) {
    if (pos.pageY < 0) direction = 'up';
    if (pos.pageY > 0) direction = 'down';

    robot.scrollMouse(1, direction);
  }
};

var handler = function(event, pos) {
  handlerFuncs[event](pos);
};

module.exports = handler;
