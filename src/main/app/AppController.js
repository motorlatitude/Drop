const path = require("path");
const log = require("electron-log");
const electron = require("electron");
const { crashReporter } = electron;

const DefaultSettings = require("../resources/Defaults").defaultSettings;
const ShortcutController = require("./ShortcutController");
const Updater = require("./../resources/Updater");
const TrayController = require("./TrayController");
const MessageHandler = require("./../ipc/MessageHandler");
const ColorFormats = require("./../resources/ColorFormats");

const HistoryWindowController = require("./../windows/HistoryWindowController");
const PickerWindowController = require("./../windows/PickerWindowController");

if (process.env.NODE_ENV === "test") {
  log.transports.file.level = false;
  log.transports.console.level = false;
}

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
    log.info("Setting Up Application");
    this._SetFlags();
    this._SetEventListeners();

    // log log path
    log.info("Log Path", log.transports.file.getFile().path || "None");
    this.logPath = path.dirname(log.transports.file.getFile().path);
    this._App.setPath("temp", this.logPath);
    log.info("Crashes Directory", crashReporter.getCrashesDirectory());
    log.info("Setting up CrashReporter");
    crashReporter.start({
      companyName: "Rabbit",
      productName: "Drop",
      ignoreSystemCrashHandler: true,
      submitURL: process.env.CRASH_REPORTER_URL
    });
  }

  /**
   * Electron has finished initializing, own logic in here
   */
  _AppIsReady() {
    log.info("Application Ready");
    // eslint-disable-next-line no-unused-vars
    const pickerWindowController = new PickerWindowController(
      this._WindowManager,
      this._Store
    );

    this.registerGlobalShortcuts();

    // eslint-disable-next-line no-unused-vars
    const historyWindowController = new HistoryWindowController(
      this._WindowManager,
      this._Store
    );
    const trayController = new TrayController(this._WindowManager, this._Store);

    new ColorFormats().then(({ c: colours, cf: colorFormats }) => {
      const messageHandler = new MessageHandler(
        this,
        this._WindowManager,
        this._Store,
        trayController,
        colorFormats,
        this._Updater
      );
      messageHandler.setupListeners();
    });
  }

  /**
   * Unregister all global shortcuts
   * @memberof AppController
   */
  unregisterGlobalShortcuts() {
    this._ShortcutManager.unsetAllGlobalShortcuts();
  }

  /**
   * Setup global shortcuts
   * @memberof AppController
   */
  registerGlobalShortcuts() {
    const allShortcuts = {
      shortcutOpenMagnifier: {},
      shortcutOpenHistory: {}
    };
    Object.keys(allShortcuts).forEach((shortcut, index) => {
      const populatedShortcutObject = {
        key: Object.keys(allShortcuts)[index],
        shortcut: "",
        callback: null,
        enabled: true
      };
      switch (populatedShortcutObject.key) {
        case "shortcutOpenMagnifier":
          populatedShortcutObject.callback = () => {
            log.log(
              "Global Shortcut Was Triggered, Toggling Picker Window Visibility"
            );
            if (this._WindowManager.windows.picker) {
              if (this._WindowManager.windows.picker.isVisible()) {
                this._WindowManager.windows.picker.hide();
              } else {
                this._WindowManager.windows.picker.show();
                this._WindowManager.windows.picker.webContents.zoomFactor = 1;
              }
            }
          };
          populatedShortcutObject.shortcut = this._Store.get(
            "settings.shortcutOpenMagnifierKeys",
            DefaultSettings.shortcutOpenMagnifierKeys
          );
          populatedShortcutObject.enabled = this._Store.get(
            "settings.shortcutOpenMagnifier",
            true
          );
          break;
        case "shortcutOpenHistory":
          populatedShortcutObject.callback = () => {
            log.log(
              "Global Shortcut Was Triggered, Toggling History Window Visibility"
            );
            if (this._WindowManager.windows.history) {
              if (this._WindowManager.windows.history.isVisible()) {
                this._WindowManager.windows.history.hide();
              } else {
                this._WindowManager.windows.history.show();
              }
            }
          };
          populatedShortcutObject.shortcut = this._Store.get(
            "settings.shortcutOpenHistoryKeys",
            DefaultSettings.shortcutOpenHistoryKeys
          );
          populatedShortcutObject.enabled = this._Store.get(
            "settings.shortcutOpenHistory",
            true
          );
          break;
      }
      allShortcuts[populatedShortcutObject.key] = populatedShortcutObject;
    });
    this._ShortcutManager.setAllGlobalShortcuts(allShortcuts);
  }

  /**
   * Set or unset the application to launch at startup
   *
   * @param {boolean} startOnLogin should application start on startup
   * @memberof AppController
   */
  setLoginItem(startOnLogin) {
    if (this._App.setLoginItemSettings) {
      this._App.setLoginItemSettings({
        openAtLogin: startOnLogin
      });
    } else {
      log.warn("We can't set the openAtLogin");
    }
  }

  /**
   * Set Apps CommandLine Flag Switches
   * @memberof AppController
   */
  _SetFlags() {
    const currentSettings = this._Store.get("settings", DefaultSettings);
    if (this._App.commandLine.appendSwitch) {
      this._App.commandLine.appendSwitch(
        "force-color-profile",
        currentSettings.colorProfile || "default"
      );
    }
    log.info("OS:", process.platform);
    if (process.platform === "linux" && this._App.commandLine.appendSwitch) {
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
      if (this._WindowManager.windows.history) {
        this._WindowManager.windows.history.removeAllListeners("close");
        this._WindowManager.windows.history.close();
      }
      if (this._WindowManager.windows.popover) {
        this._WindowManager.windows.popover.removeAllListeners("close");
        this._WindowManager.windows.popover.close();
      }
      if (this._WindowManager.windows.settings) {
        this._WindowManager.windows.settings.removeAllListeners("close");
        this._WindowManager.windows.settings.close();
      }
      if (this._WindowManager.windows.picker) {
        this._WindowManager.windows.picker.removeAllListeners("close");
        this._WindowManager.windows.picker.close();
      }
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
