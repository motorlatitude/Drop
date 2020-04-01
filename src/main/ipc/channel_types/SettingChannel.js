const log = require("electron-log");

const DefaultSettings = require("../../resources/Defaults").defaultSettings;
const Channel = require("./Channel");

/**
 * SettingsChannel Class
 *
 * Handles all messages coming from renderer process in the SETTINGS IPC channel
 * @class SettingChannel
 * @extends {Channel}
 */
class SettingChannel extends Channel {
  /**
   * Creates an instance of SettingChannel.
   * @param {{windowManager: WindowManager, store: ElectronStore, tray: ElectronTray, colorFormats: ColorFormats}} channelProps
   * @param {event} ipcEventObject ipc event object
   * @param {{type: ('CHECK_UPDATE' | 'DOWNLOAD_UPDATE' | 'INSTALL_UPDATE' | 'MODIFY_SETTING' | 'GET_SETTING' | 'GET_ALL_SETTINGS'), args: *}} [ipcEventDataObject] the included data
   * @param {electron-updater} autoUpdater electron autoUpdater instance
   * @param {AppController} appController the app controller instance for the application
   * @memberof SettingChannel
   */
  constructor(
    channelProps,
    ipcEventObject,
    ipcEventDataObject,
    autoUpdater,
    appController
  ) {
    super(
      channelProps.windowManager,
      channelProps.store,
      channelProps.tray,
      channelProps.colorFormats
    );
    switch (ipcEventDataObject.type) {
      case "CHECK_UPDATE":
        return this.checkForUpdate(autoUpdater);
      case "DOWNLOAD_UPDATE":
        return this.downloadUpdate(autoUpdater);
      case "INSTALL_UPDATE":
        return this.installUpdate(autoUpdater);
      case "MODIFY_SETTING":
        return this.modifySetting(
          ipcEventDataObject.args,
          autoUpdater,
          appController
        );
      case "GET_SETTING":
        return this.getSetting(ipcEventDataObject.args);
      case "GET_ALL_SETTINGS":
        return this.getAllSettings();
      case "DISABLE_SHORTCUTS":
        return this.disableShortcuts(appController);
      case "ENABLE_SHORTCUTS":
        return this.enableShortcuts(appController, channelProps.windowManager);
    }
  }

  /**
   * Enable all global shortcuts
   * @param {AppController} appController the controller for the application
   * @param {WindowManager} windowManager the WindowManager instance for the application
   */
  enableShortcuts(appController, windowManager) {
    appController.registerGlobalShortcuts();
    if (windowManager.windows.picker) {
      windowManager.windows.picker.webContents.send("SHORTCUTS_UPDATED", {});
    }
  }

  /**
   *  Disable all global shortcuts
   * @param {AppController} appController the controller for the application
   */
  disableShortcuts(appController) {
    appController.unregisterGlobalShortcuts();
  }

  /**
   * Get a setting property
   * @param {{type: string}} args getting arguments
   * @return {{response: any}} returns the value for the requested setting,
   * will return `undefined` if the setting can't be found.
   * @memberof SettingChannel
   */
  getSetting(args) {
    const currentSettings = this.Store.get("settings", DefaultSettings);
    log.log("GET", args.key, currentSettings[args.key]);
    return { response: currentSettings[args.key] };
  }

  /**
   * Get all setting properties and values
   * @return {{any}} returns all settings as a dictionary
   * @memberof SettingChannel
   */
  getAllSettings() {
    const currentSettings = this.Store.get("settings", DefaultSettings);
    log.log("GET_ALL", currentSettings);
    return currentSettings;
  }

  /**
   * Set or update a setting property
   * @param {{key: string, value: *}} args setting arguments
   * @param {Updater} autoUpdater the Updater instance that is in charge of updating the application
   * @param {ApPController} appController the AppController instance for the application
   * @return {undefined} returns undefined on completion
   * @memberof SettingChannel
   */
  modifySetting(args, autoUpdater, appController) {
    const currentSettings = this.Store.get("settings", DefaultSettings);
    currentSettings[args.key] = args.value;
    this.Store.set("settings", currentSettings);

    // Hot Swap Settings
    switch (args.key) {
      case "launchOnStartup":
        appController.setLoginItem(args.value);
        break;
      case "autoCheckDownloadUpdates":
        autoUpdater.stopCheckInterval();
        if (args.value) {
          autoUpdater.startCheckInterval();
        }
        break;
      default:
        // log.log("Unhandled settings key", args.key);
        break;
    }

    return undefined;
  }

  /**
   * Check github releases if update available
   * @param {Updater} autoUpdater the Updater instance for the application
   */
  async checkForUpdate(autoUpdater) {
    await autoUpdater.checkForUpdates().catch(err => {
      return {
        error: err
      };
    });
    return {
      error: null
    };
  }

  /**
   * Download latest github release update
   * @param {Updater} autoUpdater the Updater instance for the application
   * @return {{downloadedUpdatePath: (boolean | string), error: (Error | null)}}
   */
  async downloadUpdate(autoUpdater) {
    const downloadedUpdatePath = await autoUpdater
      .downloadLatestUpdate()
      .catch(err => {
        return {
          downloadedUpdatePath: false,
          error: err
        };
      });
    return {
      downloadedUpdatePath,
      error: null
    };
  }

  /**
   * Install update
   * @param {Electron-Updater} autoUpdater the autoUpdater instance for the app
   */
  installUpdate(autoUpdater) {
    autoUpdater.quitAndInstall(true, true);
  }
}

module.exports = SettingChannel;
