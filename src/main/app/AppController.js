const path = require("path");
const log = require("electron-log");
const electron = require("electron");
const { crashReporter } = electron;

const ShortcutController = require("./ShortcutController");
const Updater = require("./../resources/Updater");
const TrayController = require("./TrayController");
const MessageHandler = require("./../ipc/MessageHandler");
const ColorFormats = require("./../resources/ColorFormats");

const HistoryWindowController = require("./../windows/HistoryWindowController");
const PickerWindowController = require("./../windows/PickerWindowController");

/**
 * AppController Class
 *
 * Handles all app functions, and initial startup items
 *
 * @class AppController
 */
class AppController {
  /**
   * Creates an instance of AppController.
   * @param {*} app electron app instance
   * @param {*} store electron-store instance
   * @param {*} wm WindowManager instance
   * @memberof AppController
   */
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
    log.info(
      "Log Path",
      log.transports.file.getFile().path
        ? log.transports.file.getFile().path
        : "None"
    );
    this.logPath = path.dirname(log.transports.file.getFile().path);
    this._App.setPath("temp", this.logPath);
    log.info("Crashes Directory", crashReporter.getCrashesDirectory());
  }

  /**
   * Electron has finished initializing, own logic in here
   */
  _AppIsReady() {
    // eslint-disable-next-line no-unused-vars
    const pickerWindowController = new PickerWindowController(
      this._WindowManager
    );

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

    // eslint-disable-next-line no-unused-vars
    const historyWindowController = new HistoryWindowController(
      this._WindowManager
    );
    const trayController = new TrayController(this._WindowManager);

    const colorFormats = new ColorFormats();
    const messageHandler = new MessageHandler(
      this,
      this._WindowManager,
      this._Store,
      trayController,
      colorFormats,
      this._Updater
    );
    messageHandler.setupListeners();
  }

  /**
   * Set or unset the application to launch at startup
   *
   * @param {boolean} startOnLogin should application start on startup
   * @memberof AppController
   */
  setLoginItem(startOnLogin) {
    this._App.setLoginItemSettings({
      openAtLogin: startOnLogin
    });
  }

  /**
   * Set Apps CommandLine Flag Switches
   * @memberof AppController
   */
  _SetFlags() {
    // TODO: create default settings object
    const currentSettings = this._Store.get("settings", {});
    this._App.commandLine.appendSwitch(
      "force-color-profile",
      currentSettings.colorProfile ? "default" : currentSettings.colorProfile
    );
    log.info(process.platform);
    if (process.platform === "linux") {
      this._App.commandLine.appendSwitch("enable-transparent-visuals");
      this._App.commandLine.appendSwitch("disable-gpu");
    }
    this.setLoginItem(currentSettings.launchOnStartup ? true : false);
  }

  /**
   * Setup App EventListeners
   * @memberof AppController
   */
  _SetEventListeners() {
    this._App.on("ready", () => {
      setTimeout(
        () => {
          this._AppIsReady();
        },
        process.platform === "linux" ? 3000 : 0
      ); // 3s delay required for transparency in linux OS
    });

    this._App.on("will-quit", () => {
      this._WindowManager.windows.picker = null;
      this._ShortcutManager.unsetAllGlobalShortcuts();
    });

    this._App.on("before-quit", () => {
      log.info("Cleanup Before Quitting");
      this._WindowManager.isQuitting = true;

      log.info("Removing Close Event Listeners From Windows");
      this._WindowManager.windows.history.removeAllListeners("close");
      this._WindowManager.windows.history.close();
      this._WindowManager.windows.popover.removeAllListeners("close");
      this._WindowManager.windows.popover.close();
      this._WindowManager.windows.settings.removeAllListeners("close");
      this._WindowManager.windows.settings.close();
      this._WindowManager.windows.picker.removeAllListeners("close");
      this._WindowManager.windows.picker.close();
    });

    this._App.on("window-all-closed", () => {
      if (process.platform !== "darwin") this._App.quit();
    });

    this._App.on("activate", () => {
      if (this._WindowManager.windows.picker === null) createWindow();
    });
  }
}

module.exports = AppController;
