const electron = require('electron');
const { BrowserWindow } = electron;

/**
 * Class WindowManager
 *
 * Handles all windows used in Drop
 *
 */
class WindowManager {

  constructor() {
    /** Object containing all windows using the window name as the key */
    this.windows = {};
  }

  createNewWindow(windowName) {
    const baseWindowOptions = {
      resizable: false,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      show: false,
      icon: __dirname + './../../assets/img/icon.png',
      webPreferences: {
        nodeIntegration: true,
        experimentalFeatures: true
      }
    };
    switch(windowName) {
      case 'history':
        baseWindowOptions.x = electron.screen.getPrimaryDisplay().workAreaSize.width - 400;
        baseWindowOptions.y = electron.screen.getPrimaryDisplay().workAreaSize.height - 210;
        baseWindowOptions.width = 390;
        baseWindowOptions.height = 210;
        break;
      case 'popover':
        baseWindowOptions.width = 340;
        baseWindowOptions.height = 260;
        baseWindowOptions.backgroundColor = "#00000000";
        baseWindowOptions.parentWindow = this.windows.history;
        break;
      case 'settings':
        baseWindowOptions.x = electron.screen.getPrimaryDisplay().workAreaSize.width/2 - 350;
        baseWindowOptions.y = electron.screen.getPrimaryDisplay().workAreaSize.height/2 - 250;
        baseWindowOptions.width = 700;
        baseWindowOptions.height = 500;
        break;
      case 'picker':
        break;
      default:
        console.warn("Un-handle Window Name", windowName);
        break;
    }

    const win = new BrowserWindow(baseWindowOptions);
    this.windows[windowName] = win;
    return this.windows[windowName];
  }

}

module.exports = WindowManager;
