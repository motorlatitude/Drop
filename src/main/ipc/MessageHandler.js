const electron = require("electron");
const { ipcMain, screen, app, shell } = electron;

const PaletteChannel = require("./channel_types/PaletteChannel");
const WindowChannel = require("./channel_types/WindowChannel");
const SettingChannel = require("./channel_types/SettingChannel");
const MouseChannel = require("./channel_types/MouseChannel");
const PickerChannel = require("./channel_types/PickerChannel");

/**
 * MessageHandler Class
 *
 * Handles IPC with render process and divides it into the separate channel types
 * for them to carry out main process functions required by the renderer process
 */
class MessageHandler {
  /**
   * Initiates new main process IPC Message Handler
   * @param {AppController} appController the main appController instance
   * @param {[BrowserWindow]} windowManager an array of all the different windows
   * @param {Store} store the electron-store instance
   * @param {Tray} tray the electron tray instance
   * @param {ColorFormats} colorFormats color format instance
   * @param {AutoUpdater} autoUpdater updater instance
   */
  constructor(
    appController,
    windowManager,
    store,
    tray,
    colorFormats,
    autoUpdater
  ) {
    this._AppController = appController;
    this._WindowManager = windowManager;
    this._Store = store;
    this._Tray = tray;
    this._ColorFormats = colorFormats;
    this._AutoUpdater = autoUpdater;
  }

  /**
   * Setup listeners for expected incoming IPC messages
   */
  setupListeners() {
    const self = this;

    const channelProps = {
      windowManager: this._WindowManager,
      store: this._Store,
      tray: this._Tray,
      colorFormats: this._ColorFormats
    };
    const au = this._AutoUpdater;
    const ac = this._AppController;

    ipcMain.handle("PALETTE", (e, a) => new PaletteChannel(channelProps, e, a));
    ipcMain.handle("WINDOW", (e, a) => new WindowChannel(channelProps, e, a));
    ipcMain.handle(
      "SETTING",
      (e, a) => new SettingChannel(channelProps, e, a, au, ac)
    );
    ipcMain.handle("MOUSE", (e, a) => new MouseChannel(channelProps, e, a));
    ipcMain.handle("PICKER", (e, a) => new PickerChannel(channelProps, e, a));

    // General App/Electron IPCs
    ipcMain.handle("get-primary-screen-size", this.getScreenSize.bind(self));
    ipcMain.on("quit-app", this.quitApp.bind(self));
    ipcMain.handle("open-logs", this.openLogsDirectory.bind(self));
  }

  /**
   * Open the logs directory using the system default explorer
   */
  openLogsDirectory() {
    shell.openItem(this._AppController.logPath);
  }

  /**
   * QUIT
   */
  quitApp() {
    this._WindowManager.isQuitting = true;
    app.quit();
  }

  /**
   * Get the primary display size
   * @return {{width: number, height: number}}
   */
  getScreenSize() {
    return screen.getPrimaryDisplay().workAreaSize;
  }
}

module.exports = MessageHandler;
