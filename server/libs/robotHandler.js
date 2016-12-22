const robot = require('robotjs');

var handlerFuncs = {
  mousemove: function(pos) {
    mouse = robot.getMousePos();
    robot.moveMouse(mouse.x + pos.x, mouse.y + pos.y);
  },

  mousedown: function() {
    robot.mouseClick();
  },

  mousedown2: function(pos) {
    robot.mouseClick('left', true);
  },

  navigatemove: function(pos) {
    let angle = Math.atan2(pos.y, pos.x);
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
    if (pos.y < 0) direction = 'up';
    if (pos.y > 0) direction = 'down';

    robot.scrollMouse(1, direction);
  },

  keydown: function(data) {
    if (data.keyCode) {
      // normalise key's name
      data.key = data.key.toLowerCase();
      data.key = mapToRobotJs(data.key);

      if (data.key) {
        robot.keyTap(data.key);
      }

    } else {
      robot.typeString(data.key);
    }
  }
};

// Map JavaScript Key event name to robotjs event
// return null if the name is a invalid robotjs event
function mapToRobotJs(eventName) {
  switch (eventName) {
    case 'ArrowLeft':
    case 'ArrowUp':
    case 'ArrowRight':
    case 'ArrowDown':
      return eventName.subString(4);
    case 'AudioVolumeMute':
      return 'audio_' + eventName.subString(11);
    case 'AudioVolumeUp':
    case 'AudioVolumeDown':
      return 'audio_vol_' + eventName.subString(11);
    case 'Meta':
      return null;
    default:
      return eventName;
  }
}

var handler = function(event, pos) {
  handlerFuncs[event](pos);
};

module.exports = handler;
