const electron = require('electron');
const platform = require('os').platform();
var pjson = require('../../package.json');

const { app, Tray, Menu } = electron;

const APP_TITLE = pjson.productName;
const ICON_PATH = `${__dirname}/../`;
const ICON_WINDOWS = 'favicon.ico';
const ICON_OSX = 'favicon.png';
let tray;

const SysTray = function SysTray() {};

SysTray.prototype.init = function init() {
  tray = null;
  setupTray();
};

function setupTray() {
  tray = new Tray(getIconFilepathForPlatform());
  tray.setToolTip(APP_TITLE);
  const contextMenu = Menu.buildFromTemplate([
    {
      label: `${APP_TITLE} is running`,
      enabled: false
    }, {
      label: 'Exit',
      click() { app.quit(); }
    }
  ]);
  tray.setContextMenu(contextMenu);
}

function getIconFilepathForPlatform() {
  let filePath;
  if (platform === 'darwin') {
    filePath = ICON_PATH + ICON_OSX;
  } else if (platform === 'win32') {
    filePath = ICON_PATH + ICON_WINDOWS;
  }
  return filePath;
}

module.exports = new SysTray();
