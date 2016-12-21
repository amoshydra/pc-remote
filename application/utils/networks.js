var os = require('os');

var network = {
  // Normalize a port into a number, string, or false.
  normalizePort: function normalizePort(val) {
    var port = parseInt(val, 10);
    if (isNaN(port))       return val;    // named pipe
    else if (port >= 0)   return port;    // port number
    else                  return false;
  },
  getLocalIP: function getLocalIP() {
    var interfaces = os.networkInterfaces();
    var addresses = [];
    for (var k in interfaces) {
      for (var k2 in interfaces[k]) {
        var address = interfaces[k][k2];
        if (address.family === 'IPv4' && !address.internal) {
          addresses.push(address.address);
        }
      }
    }
    return addresses;
  }
};

module.exports = network;
