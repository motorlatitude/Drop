const log = require("electron-log");

const ShortcutController = require("./ShortcutController");
const Updater = require("./../resources/Updater");
const TrayController = require("./TrayController");
const MessageHandler = require("./../ipc/MessageHandler");
const ColorFormats = require("./../resources/ColorFormats");

const HistoryWindowController = require("./../windows/HistoryWindowController");
const PickerWindowController = require("./../windows/PickerWindowController");

class AppController {
  constructor(app, store, wm) {
    // setup logger
    log.transports.file.level = "silly";

    // setup private props
    this._App = app;
    this._Store = store;
    this._WindowManager = wm;
    this._ShortcutManager = new ShortcutController();
    this._Updater = new Updater(this._Store, this._WindowManager);

    // call private methods
    this._SetFlags();
    this._SetEventListeners();

    // log log path
    log.info("Log Path", log.transports.file.getFile().path ? log.transports.file.getFile().path : "None");
  }

  /**
   * Electron has finished initializing, own logic in here
   */
  _AppIsReady() {
    const pickerWindowController = new PickerWindowController(this._WindowManager);

    this._ShortcutManager.setGlobalShortcut("CommandOrControl+I", () => {
      log.log("Global Shortcut Was Triggered, Showing Picker Window");
      if (this._WindowManager.windows.picker) {
        if (this._WindowManager.windows.picker.isVisible()) {
          this._WindowManager.windows.picker.hide();
        } else {
          this._WindowManager.windows.picker.show();
          this._WindowManager.windows.picker.webContents.zoomFactor = 1;
        }
      }
    });

    const historyWindowController = new HistoryWindowController(this._WindowManager);
    const trayController = new TrayController(this._WindowManager);

    let colorFormats = new ColorFormats();
    let messageHandler = new MessageHandler(
      this,
      this._WindowManager,
      this._Store,
      trayController,
      colorFormats,
      this._Updater
    );
    messageHandler.setupListeners();
  }

  setLoginItem(startOnLogin) {
    this._App.setLoginItemSettings({
      openAtLogin: startOnLogin
    });
  }

  /**
   * Set Apps CommandLine Flag Switches
   */
  _SetFlags() {
    const currentSettings = this._Store.get("settings", {}); //TODO: create default settings object
    this._App.commandLine.appendSwitch(
      "force-color-profile",
      currentSettings.colorProfile === undefined ? "default" : currentSettings.colorProfile
    ); //TODO: further research into this for selecting color profile for app, possible option in settings for different types

    this.setLoginItem(currentSettings.launchOnStartup === undefined || currentSettings.launchOnStartup ? true : false);
  }

  /**
   * Setup App EventListeners
   */
  _SetEventListeners() {
    this._App.on("ready", this._AppIsReady.bind(this));

    this._App.on("will-quit", () => {
      this._WindowManager.windows.picker = null;
      this._ShortcutManager.unsetAllGlobalShortcuts();
    });

    this._App.on("before-quit", () => {
      log.info("Cleanup Before Quitting");
      this._WindowManager.isQuitting = true;
      log.info("Removing Close Event Listeners From Windows");
      Object.keys(this._WindowManager.windows).forEach(windowName => {
        this._WindowManager.windows[windowName].removeAllListeners("close");
        this._WindowManager.windows[windowName].close();
      });
    });

    this._App.on("window-all-closed", function() {
      if (process.platform !== "darwin") this._App.quit();
    });

    this._App.on("activate", function() {
      if (this._WindowManager.windows.picker === null) createWindow();
    });
  }
}

module.exports = AppController;
