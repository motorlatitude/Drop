const electron = require("electron");
const { BrowserWindow, nativeImage } = electron;
const log = require("electron-log");
const path = require("path");

/**
 * Class WindowManager
 *
 * Handles all windows used in Drop
 *
 */
class WindowManager {
  /**
   * Creates an instance of WindowManager.
   * @memberof WindowManager
   */
  constructor() {
    /** Object containing all windows using the window name as the key */
    this.windows = {};

    /** Property states if app is quitting or not */
    this.isQuitting = false;
  }

  /**
   * Create a new window
   *
   * @param {*} controller the parent window controller
   * @param {string} windowName the name of the window type
   * @return {BrowserWindow}
   * @memberof WindowManager
   */
  createNewWindow(controller, windowName) {
    const icn = nativeImage.createFromPath(
      path.resolve(__dirname, "./../../assets/img/icon.png")
    );
    const baseWindowOptions = {
      x: electron.screen.getPrimaryDisplay().workArea.x,
      y: electron.screen.getPrimaryDisplay().workArea.y,
      resizable: false,
      transparent: true,
      frame: false,
      alwaysOnTop: true,
      show: false,
      icon: icn,
      webPreferences: {
        nodeIntegration: true,
        experimentalFeatures: true
      }
    };
    switch (windowName) {
      case "history":
        baseWindowOptions.x =
          electron.screen.getPrimaryDisplay().workArea.x +
          electron.screen.getPrimaryDisplay().workAreaSize.width -
          400;
        baseWindowOptions.y =
          electron.screen.getPrimaryDisplay().workArea.y +
          electron.screen.getPrimaryDisplay().workAreaSize.height -
          210;
        baseWindowOptions.width = 390;
        baseWindowOptions.height = 210;
        break;
      case "popover":
        baseWindowOptions.width = 340;
        baseWindowOptions.height = 260;
        baseWindowOptions.backgroundColor = "#00000000";
        baseWindowOptions.parentWindow = this.windows.history;
        break;
      case "settings":
        baseWindowOptions.x =
          electron.screen.getPrimaryDisplay().workArea.x +
          electron.screen.getPrimaryDisplay().workAreaSize.width / 2 -
          350;
        baseWindowOptions.y =
          electron.screen.getPrimaryDisplay().workArea.y +
          electron.screen.getPrimaryDisplay().workAreaSize.height / 2 -
          250;
        baseWindowOptions.width = 700;
        baseWindowOptions.height = 500;
        baseWindowOptions.alwaysOnTop = false;
        break;
      case "picker":
        break;
      default:
        log.warn("Un-handle Window Name", windowName);
        break;
    }

    const win = new BrowserWindow(baseWindowOptions);
    win.windowController = controller;
    this.windows[windowName] = win;
    return this.windows[windowName];
  }
}

module.exports = WindowManager;
