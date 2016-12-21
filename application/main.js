'use strict';

const electron = require('electron');
const express = require('../server/bin/server');
const tray = require('./controllers/tray');
const networksUtil = require('./utils/networks');
const { app, BrowserWindow, webContents } = electron;

// Get port from environment and Initialize server
var network = {
  port: networksUtil.normalizePort(process.env.PORT || '3000'),
  addresses: networksUtil.getLocalIP()
};

// Run express server
express(network.port);

// Run electron app
app.on('ready', function() {
  tray.init(network);
});
