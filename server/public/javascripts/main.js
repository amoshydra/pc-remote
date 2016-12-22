'use strict';

var socket = io();
var surface = document.getElementById('control-surface');
var scroll = document.getElementById('scroll-surface');
var btnToggleMode = document.getElementById('action-toggle');
var inputField = document.getElementById('action-text');

var constants = {
  controlModes: {
    mouse: 'mouse',
    navigation: 'navigate'
  },
  scrollMultInterval: 10
};
var config = {
  control: {
    mode: constants.controlModes.mouse,
    matches: function (mode) {
      return (mode === this.mode);
    },
    set: function(mode) {
      this.mode = mode;
    },
    get: function() {
      return this.mode;
    }
  },
  scrollDelay: 4,
  moveSpeed: 2,
  touchThreshold: 10
}

btnToggleMode.addEventListener('click', function() {
  if (config.control.matches(constants.controlModes.mouse)) {
    config.control.set(constants.controlModes.navigation);
  } else {
    config.control.set(constants.controlModes.mouse);
  }
  btnToggleMode.innerText = config.control.get();
});


/* Possible scenario
*   1. Chrome mobile
        - Receive single character { key: "Unidentified"; keyCode: 229 }
        - Receive word from auto-suggest / complete (same as above)
        - Receive non-display character (has unique key and keyCode)
    2. Microsoft Windows 10 Chrome
        - Receive single character (has unique key and keycode).
            - however keyCode does not differentiate upper / lowercase
        - Receive chinese character { key: "Process"; keyCode: 261 }

*/
inputField.addEventListener('keyup', keyup);
inputField.addEventListener('input', input);

function input(event) {
  var data = {
    key: inputField.value,
  };
  inputField.value = '';

  // return displayable character
  console.log(data);
  socket.emit('key', 'keydown', data);
}

function keyup(event) {
  // Store current event data
  var data = {
    key: event.key,
    keyCode: event.keyCode
  };

  if ((data.keyCode === 229)        ||  // [1] Android Chrome text input (229 buffer busy).
      (data.key === 'Unidentified') ||  //     This will most likely return 'Unidentified' too
      (data.keyCode === 261)        ||  // [2] Windows 10 Chrome chinese character selector character
      (data.key.length === 1))          // [3] Match non-displayable character on most device.
  {
    // We let `input` event handle this.
    return;
  }


  // This should return non-displayable character only
  console.log(data);
  socket.emit('key', 'keydown', data);
}

(function(){
  var ptStat = {
    init: { x: 0, y: 0 },
    prev: { x: 0, y: 0 },
    diff: { x: 0, y: 0 },
    bool: {
      isActive: false,
      isMoving: false
    },
    updatePrev: function(event) {
      this.prev.x = event.pageX;
      this.prev.y = event.pageY;
    },
    updateInit: function(event) {
      this.init.x = event.pageX;
      this.init.y = event.pageY;
    },
    updateDiff: function(event, mult) {
      mult = mult || 1;

      this.diff.x = (event.pageX - this.prev.x) * mult;
      this.diff.y = (event.pageY - this.prev.y) * mult;
    },
    reset: function() {
      this.bool.isActive = false;
      this.bool.isMoving = false;
    }
  };

  var pointerdown = function pointerdown(event) {
    ptStat.updatePrev(event);
    ptStat.updateInit(event);

    ptStat.bool.isActive = true;
  }

  var pointermove = function pointermove(event) {
    ptStat.bool.isMoving = true;

    if (ptStat.bool.isActive && config.control.matches(constants.controlModes.mouse)) {
      event.preventDefault();

      ptStat.updateDiff(event, config.moveSpeed);
      ptStat.updatePrev(event);

      socket.emit('key', 'mousemove', ptStat.diff);
    }
  }

  var pointerup = function pointerup(event) {
    if (config.control.matches(constants.controlModes.mouse)) {
      if (!ptStat.bool.isMoving) {
        socket.emit('key', 'mousedown', { x: event.pageX, y: event.pageY });
      }
    } else if (config.control.matches(constants.controlModes.navigation)) {

      var travel = {
        x: event.pageX - ptStat.init.x,
        y: event.pageY - ptStat.init.y
      };
      var pseudoMagnitude = (travel.x + travel.y) / 2;

      if (Math.abs(pseudoMagnitude) < config.touchThreshold) {
        socket.emit('key', 'navigateenter', { x: event.pageX, y: event.pageY });
      } else {
        socket.emit('key', 'navigatemove', travel);
      }
    }

    ptStat.reset();
  }

  surface.addEventListener('pointerdown', pointerdown);
  surface.addEventListener('pointermove', pointermove);
  surface.addEventListener('pointerup', pointerup)

}());

(function(){
  var ptStat = {
    prev: { x: 0, y: 0 },
    diff: { x: 0, y: 0 },
    bool: {
      isActive: false,
      isMoving: false
    },
    updatePrev: function(event) {
      this.prev.x = event.pageX;
      this.prev.y = event.pageY;
    },
    updateDiff: function(event) {
      this.diff.x = event.pageX - this.prev.x;
      this.diff.y = event.pageY - this.prev.y;
    }
  };

  var pointerdown = function pointerdown(event) {
    ptStat.updatePrev(event);
    ptStat.bool.isTouching = true;
  }

  var pointerup = function pointerup(event) {
    ptStat.bool.isTouching = false;
  }

  var pointermove = function pointermove(event) {
    if (ptStat.bool.isTouching) {
      event.preventDefault();
      ptStat.updateDiff(event);
      ptStat.updatePrev(event);

      socket.emit('key', 'scroll', ptStat.diff);
    }
  }

  var scrollSpeed = config.scrollDelay * constants.scrollMultInterval;
  scroll.addEventListener('pointerdown', pointerdown);
  scroll.addEventListener('pointermove', _.throttle(pointermove, scrollSpeed));
  scroll.addEventListener('pointerup', pointerup);

}());
