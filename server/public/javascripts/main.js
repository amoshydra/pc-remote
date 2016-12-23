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


/*
  Key press sequence:
    > [0 - keydown]       - Differentiate for non-displayable character
      > [1 - keypress]    - / Not used /
        > [2 - input]     - Input character will be used to buffer user input
          > [3 - keyup]   - / Not used /
*/
inputField.addEventListener('keydown', keydown);
inputField.addEventListener('input', input);

/*
  [0 - keydown]
  :: input[2] will not be triggered if key is a none displayable character
  :: keyup[3] will still be triggered
*/
var shouldPropagate = true;
function keydown(e) {

  // Normalise keycode
  var keyCode = e.keyCode || e.which;

  // Reject processing displayable character at this stage
  if ((keyCode === 229)           ||  // 1. Android Chrome / iOS text input (229 = buffer busy).
      (e.key === 'Unidentified')  ||  //     This will most likely return 'Unidentified' too
      (keyCode === 261))              // 2. Windows 10 Chrome chinese character selector character
  {
    // We will let `input` event handle this.
    return;
  }

  // Process unrejected input
  //  Most likely none displayable character

  // Normalise key
  var key = e.key || getKeyFromKeyCode(e.keyCode || e.which);

  // Send key
  socket.emit('key', 'keydown', { key: key, type: e.type });

  // [2][3] will not be triggered
  // except for "Enter - 13" key
  if (key === 'Enter') shouldPropagate = false;
}

/*
  [2 - input]
  :: Allow user to keep typing and use debounce to send the data string
  :: Once the time is up, send data and clear input field

  :: Note: 
  ::  - iOS Pin Yin will trigger input event without keydown or keyup
  ::  - clearing input field does not remove iOS keyboard buffer.
*/
var debounceBuffer = null;
function input(e) {

  // Previous eventListener requested to stop propagation 
  if (!shouldPropagate) {
    shouldPropagate = true; // restore the boolean
    return; // stop execution
  }

  if (!debounceBuffer) {
    // create debounce if not exist
    debounceBuffer = _.debounce(function() {
      var data = inputField.value;
      inputField.value = '';

      socket.emit('key', 'keydown', { key: data, type: e.type });
      debounceBuffer = null;    
    }, 1500);
  }
  
  // execute debounce
  debounceBuffer();
}

var keyCodeMap = {
  8: 'Backspace',
  13: 'Enter',
  27: 'Esc'
}

function getKeyFromKeyCode(keyCode) {
  return keyCodeMap[keyCode];
}

// var previousLength = 1;
// var debounceBuffer;
// function input(event) {
//   var data = {
//     key: inputField.value
//   };
//   var keyCode = inputField.value.charCodeAt(0);


//   if (true) {
//     // is a Unicode character, decide accordingly

//     if (data.key.length > previousLength) {
//       // New character is inserted to the back of the string

//       // store all previous input
//       data.key = inputField.value.substring(0, previousLength);
//       // clear all previous input on input box
//       console.log('ori: ' + inputField.value + 'remain: ' + inputField.value.substring(previousLength));
//       inputField.value = inputField.value.substring(previousLength);
//       // immediately send data
//       socket.emit('key', 'keydown', data);
//       // clear buffer if exist
//       if (debounceBuffer) {
//         debounceBuffer.cancel();
//         debounceBuffer = null;
//       }
//     } else if (previousLength < previousLength) {
//       // ?? Deletion ??

//       // clear buffer if exist      
//       if (debounceBuffer) {
//         debounceBuffer.cancel();
//         debounceBuffer = null;
//       }
//       console.log('meow');

//     } else {
//       // no change in input length, user could be still entering data

//       if (debounceBuffer) {
//         debounceBuffer();
//       } else {
//         debounceBuffer = _.debounce(function() {
//           console.log('entered');
//           data.key = inputField.value;
//           inputField.value = '';    
//           socket.emit('key', 'keydown', data);

//           debounceBuffer = null;
//         }, 1500);
//       }
//     }

//     previousLength = data.key.length;
//     if (previousLength < 1) previousLength = 1;
//   }

//   // keep one character, if character is acsii send immediately
//   // else, 1. wait 2 seconds and send
//   //       2. if additional character is inserted send previous immediately

//   if (constants.isIOS) {

//     previousLength = inputField.value.length;
//   } else {

//     console.log(data);
//   }
// }

// function keyup(event) {
//   // Store current event data
//   var data = {
//     key: event.key,
//     keyCode: event.which || event.keyCode
//   };

//   if ((data.keyCode === 229)        ||  // [1] Android Chrome text input (229 buffer busy).
//       (data.key === 'Unidentified') ||  //     This will most likely return 'Unidentified' too
//       (data.keyCode === 261)        ||  // [2] Windows 10 Chrome chinese character selector character
//       (data.key.length === 1))          // [3] Match non-displayable character on most device.
//   {
//     // We let `input` event handle this.
//     return;
//   }


//   // This should return non-displayable character only
//   console.log(data);
//   socket.emit('key', 'keydown', data);
// }

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


var dynamicLine = document.getElementById('dynamic-line');
dynamicLine.style.height = (window.innerHeight - 100) + 'px';
window.addEventListener('resize', function() {
  dynamicLine.style.height = (window.innerHeight - 100) + 'px';
});