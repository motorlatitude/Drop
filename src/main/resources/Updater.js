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
    this._AutoUpdaterInterval = null;
    autoUpdater.logger = log;
    autoUpdater.logger.transports.file.level = "info";
    const settings = store.get("settings", {});
    this._AutoCheck =
      settings.autoCheckDownloadUpdates === undefined || settings.autoCheckDownloadUpdates === true ? true : false;
    autoUpdater.autoDownload = this._AutoCheck;

    // Attempt to start auto updating interval if settings permit
    this.startCheckInterval();
  }

  /**
   * Start the automatic update checking interval
   *
   * @memberof Updater
   */
  startCheckInterval() {
    if (this._AutoCheck) {
      log.info("Starting Automatic Update Checking Interval");
      this._AutoUpdaterInterval = setInterval(() => {
        const settings = this._Store.get("settings", {});
        this._AutoCheck =
          settings.autoCheckDownloadUpdates === undefined || settings.autoCheckDownloadUpdates === true ? true : false;
        if (
          this._AutoCheck &&
          settings.lastUpdateCheck !== undefined &&
          new Date().getTime() - settings.lastUpdateCheck >= 3600000
        ) {
          log.info("Auto Checking For Updates");
          this.checkForUpdates();
        }
      }, 3600000);
    }
  }

  /**
   * Stop the automatic update checking interval
   *
   * @memberof Updater
   */
  stopCheckInterval() {
    if (this._AutoUpdaterInterval !== null) {
      log.info("Stopping Automatic Update Checking Interval");
      clearInterval(this._AutoUpdaterInterval);
      this._AutoUpdaterInterval = null;
    }
  }

  /**
   * Checks for any available updates for the application
   */
  async checkForUpdates() {
    return await autoUpdater.checkForUpdates().catch(err => {
      log.error(err);
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
