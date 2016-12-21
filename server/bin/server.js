#!/usr/bin/env node

var server = function(port) {

  // Module dependencies.
  var app = require('../app');
  var debug = require('debug')('remote-control-server:server');
  var http = require('http');
  var IOManager = require('../libs/IOManager');

  // Store port in Express.
  app.set('port', port);

  // Create HTTP server.
  var server = http.createServer(app);
  IOManager(server); // Initialize socket.io

  // Listen on provided port, on all network interfaces.
  server.listen(port);
  server.on('error', onError);
  server.on('listening', onListening);

  // Event listener for HTTP server "error" event.
  function onError(error) {
    if (error.syscall !== 'listen') {
      throw error;
    }

    var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
      case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
      default:
      throw error;
    }
  }

  // Event listener for HTTP server "listening" event.
  function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
    debug('Listening on ' + bind);
  }
};

module.exports = server;