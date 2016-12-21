'use strict';

const electron = require('electron');
const express = require('../server/bin/www');
const tray = require('./controllers/tray');
const { app, BrowserWindow, webContents } = electron;

express();

app.on('ready', function() {
  tray.init();
});
