const electron = require('electron');
const platform = require('os').platform();
const pjson = require('../../package.json');

const { app, Tray, Menu } = electron;

const APP_TITLE = pjson.productName;
const ICON_PATH = `${__dirname}/../`;
const ICON_WINDOWS = 'favicon.ico';
const ICON_OSX = 'favicon.png';
let tray;
let network;

const SysTray = function SysTray() {};

SysTray.prototype.init = function init(_network) {
  tray = null;
  network = _network;
  setupTray();
};

function setupTray() {
  tray = new Tray(getIconFilepathForPlatform());
  tray.setToolTip(APP_TITLE);

  // Set up menu template
  let menuTemplate = [{
    label: `${APP_TITLE} is listening on`,
    enabled: false
  }];

  network.addresses.forEach((address, index) => {
    menuTemplate.push({
      label: `  ${address}:${network.port}`,
      enabled: false
    });
  });

  menuTemplate.push({
    label: 'Exit',
    click() { app.quit(); }
  });

  // Build menu template
  const contextMenu = Menu.buildFromTemplate(menuTemplate);
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
