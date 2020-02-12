const log = require("electron-log");

const { autoUpdater } = require("electron-updater");

/**
 * Updater Class
 *
 * Handles Updating Application and auto-updater events
 */
class Updater {
  /**
   * Constructs new Electron Auto Updater Instance
   * @param {electron-store} store the apps electron-store instance
   * @param {WindowManager} wm the apps WindowManager instance
   */
  constructor(store, wm) {
    this._Store = store;
    this._WindowManager = wm;
    this._configureEventListener();
    autoUpdater.logger = log;
    autoUpdater.logger.transports.file.level = "info";
    autoUpdater.autoDownload = false;
  }

  /**
   * Checks for any available updates for the application
   */
  async checkForUpdates() {
    return await autoUpdater.checkForUpdates().catch(err => {
      log.error(err);
      reject(err);
    });
  }

  /**
   * Download the newest update
   */
  async downloadLatestUpdate() {
    return await autoUpdater.downloadUpdate().catch(err => {
      log.error(err);
    });
  }

  _configureEventListener() {
    autoUpdater.on("error", err => {
      log.error(err);
    });

    autoUpdater.on("checking-for-updates", () => {
      log.info("Checking for newer version");
    });

    autoUpdater.on("update-available", info => {
      log.info("A newer version is available", info);
      const currentSettings = this.Store.get("settings", {}); //TODO: create default settings object
      if (currentSettings.autoCheckDownloadUpdates === true) {
        this.downloadLatestUpdate();
        if (this._WindowManager.windows.settings) {
          this._WindowManager.windows.settings.webContents.send("UPDATER-DOWNLOADING");
        }
      } else {
        this._WindowManager.windows.settings.webContents.send("UPDATER-UPDATE-AVAILABLE");
      }
    });

    autoUpdater.on("update-not-available", info => {
      log.info("Update is not available", info);
      if (this._WindowManager.windows.settings) {
        this._WindowManager.windows.settings.webContents.send("UPDATER-UPDATE-UNAVAILABLE");
      }
    });

    autoUpdater.on("download-progress", (progress, bytesPerSecond, percent, total, transferred) => {
      log.info("Update Downloading", percent);
      if (this._WindowManager.windows.settings) {
        this._WindowManager.windows.settings.webContents.send("UPDATER-DOWNLOADING");
      }
    });

    autoUpdater.on("update-downloaded", info => {
      log.info("Update has been downloaded", info);
      const currentSettings = this.Store.get("settings", {}); //TODO: create default settings object
      if (currentSettings.autoInstallUpdates === true) {
        autoUpdater.quitAndInstall(true, true);
      } else {
        if (this._WindowManager.windows.settings) {
          this._WindowManager.windows.settings.webContents.send("UPDATER-UPDATE-DOWNLOADED");
        }
      }
    });
  }
}

module.exports = Updater;
