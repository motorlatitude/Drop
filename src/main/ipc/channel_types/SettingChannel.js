const log = require("electron-log");

const Channel = require("./Channel");

class SettingChannel extends Channel {
  /**
   * Creates an instance of SettingChannel.
   * @param {{windowManager: WindowManager, store: ElectronStore, tray: ElectronTray, colorFormats: ColorFormats}} channelProps
   * @param {event} ipcEventObject ipc event object
   * @param {{type: 'CHECK_UPDATE' | 'DOWNLOAD_UPDATE' | 'INSTALL_UPDATE' | 'MODIFY_SETTING' | 'GET_SETTING' | 'GET_ALL_SETTINGS', args: *}} [ipcEventDataObject] the included data
   * @param {electron-updater} autoUpdater electron autoUpdater instance
   * @memberof SettingChannel
   */
  constructor(channelProps, ipcEventObject, ipcEventDataObject, autoUpdater, appController) {
    super(channelProps.windowManager, channelProps.store, channelProps.tray, channelProps.colorFormats);
    switch (ipcEventDataObject.type) {
      case "CHECK_UPDATE":
        return this.checkForUpdate(autoUpdater);
      case "DOWNLOAD_UPDATE":
        return this.downloadUpdate(autoUpdater);
      case "INSTALL_UPDATE":
        return this.installUpdate(autoUpdater);
      case "MODIFY_SETTING":
        return this.modifySetting(ipcEventDataObject.args, autoUpdater, appController);
      case "GET_SETTING":
        return this.getSetting(ipcEventDataObject.args);
      case "GET_ALL_SETTINGS":
        return this.getAllSettings();
    }
  }

  /**
   * Get a setting property
   * @param {{type: string}} args getting arguments
   */
  getSetting(args) {
    const currentSettings = this.Store.get("settings", {}); //TODO: create default settings object
    log.log("GET", args.key, currentSettings[args.key]);
    return { response: currentSettings[args.key] };
  }

  /**
   * Get all setting properties and values
   */
  getAllSettings() {
    const currentSettings = this.Store.get("settings", {}); //TODO: create default settings object
    log.log("GET_ALL", currentSettings);
    return currentSettings;
  }

  /**
   * Set or update a setting property
   * @param {{key: string, value: *}} args setting arguments
   */
  modifySetting(args, autoUpdater, appController) {
    const currentSettings = this.Store.get("settings", {}); //TODO: create default settings object
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
        //log.log("Unhandled settings key", args.key);
        break;
    }

    return undefined;
  }

  /**
   * Check github releases if update available
   */
  async checkForUpdate(autoUpdater) {
    const isUpdateAvailable = await autoUpdater.checkForUpdates().catch(err => {
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
   */
  async downloadUpdate(autoUpdater) {
    const downloadedUpdatePath = await autoUpdater.downloadLatestUpdate().catch(err => {
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
