'use strict';

var socket = io();
var surface = document.getElementById('control-surface');
var scroll = document.getElementById('scroll-surface');
var btnToggleMode = document.getElementById('action-toggle');

var controlMode = 'mouse';

btnToggleMode.addEventListener('click', function() {
  var currentMode = btnToggleMode.innerText;

  if (currentMode.toLowerCase() === 'mouse') {
    controlMode = 'navigation';
  } else {
    controlMode = 'mouse';
  }
  btnToggleMode.innerText = controlMode;
});

(function(){
  var previous = {
    pageX: 0,
    pageY: 0
  };
  var diff = {
    pageX: 0,
    pageY: 0
  };

  var isTouching = false;
  var isMoving = false;
  var firstTouch = {};

  surface.addEventListener('pointerdown', function(event) {
    previous.pageX = event.pageX;
    previous.pageY = event.pageY;

    firstTouch.pageX = event.pageX;
    firstTouch.pageY = event.pageY;

    isTouching = true;
  });

  surface.addEventListener('pointermove', function(event) {
    isMoving = true;
    if (isTouching && (controlMode === 'mouse')) {
      event.preventDefault();
      diff.pageX = event.pageX - previous.pageX;
      diff.pageY = event.pageY - previous.pageY;
      previous.pageX = event.pageX;
      previous.pageY = event.pageY;

      socket.emit('key', 'mousemove', diff);
    }
  });

  surface.addEventListener('pointerup', function(event) {

    let travel = {
      pageX: event.pageX - firstTouch.pageX,
      pageY: event.pageY - firstTouch.pageY
    };
    let magnitude = Math.sqrt((travel.pageX * travel.pageX) + (travel.pageY * travel.pageY));
    if (magnitude < 50) {
      if (controlMode === 'mouse') {
        socket.emit('key', 'mousedown', { pageX: event.pageX, pageY: event.pageY });
      } else {
        socket.emit('key', 'navigateenter', { pageX: event.pageX, pageY: event.pageY });
      }

    } else {
      if (controlMode === 'navigation')
        socket.emit('key', 'navigatemove', travel);
    }

    isTouching = false;
    isMoving = false;
  });

}());

(function(){
  var previous = {
    pageX: 0,
    pageY: 0
  };
  var diff = {
    pageX: 0,
    pageY: 0
  };

  var isTouching = false;

  scroll.addEventListener('pointerdown', function(event) {
    previous.pageX = event.pageX;
    previous.pageY = event.pageY;

    isTouching = true;
  });

  scroll.addEventListener('pointermove', _.throttle(scrollPage, 10 * 4));

  scroll.addEventListener('pointerup', function(event) {
    isTouching = false;
  });

  function scrollPage(event) {
    if (isTouching) {
      event.preventDefault();
      diff.pageX = event.pageX - previous.pageX;
      diff.pageY = event.pageY - previous.pageY;
      previous.pageX = event.pageX;
      previous.pageY = event.pageY;

      socket.emit('key', 'scroll', diff);
    }
  }

}());
