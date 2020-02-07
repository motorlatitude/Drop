const log = require('electron-log');

const Channel = require('./Channel');

class SettingChannel extends Channel {

  /**
   * Creates an instance of SettingChannel.
   * @param {{windowManager: WindowManager, store: ElectronStore, tray: ElectronTray, colorFormats: ColorFormats}} channelProps
   * @param {event} ipcEventObject ipc event object
   * @param {{type: 'CHECK_UPDATE' | 'MODIFY_SETTING' | 'GET_SETTING', args: *}} [ipcEventDataObject] the included data
   * @param {electron-updater} autoUpdater electron autoUpdater instance
   * @memberof SettingChannel
   */
  constructor(channelProps, ipcEventObject, ipcEventDataObject, autoUpdater) {
    super(channelProps.windowManager, channelProps.store, channelProps.tray, channelProps.colorFormats);
    switch (ipcEventDataObject.type) {
      case 'CHECK_UPDATE':
        return this.checkForUpdate(autoUpdater);
      case 'MODIFY_SETTING':
        return this.modifySetting(ipcEventDataObject.args);
      case 'GET_SETTING':
        return this.getSetting(ipcEventDataObject.args);
    }
  }

  /**
   * Get a setting property
   * @param {{type: string}} args getting arguments
   */
  getSetting(args) {
    const currentSettings = this.Store.get("settings", {}); //TODO: create default settings object
    return {response: currentSettings[args.key]};
  }

  /**
   * Set or update a setting property
   * @param {{key: string, value: *}} args setting arguments
   */
  modifySetting(args) {
    const currentSettings = this.Store.get("settings", {}); //TODO: create default settings object
    currentSettings[args.key] = args.value;
    this.Store.set("settings", currentSettings);
    return undefined;
  }

  /**
   * Check github releases if update available
   */
  async checkForUpdate(autoUpdater) {
    return await autoUpdater.checkForUpdates().then((results) => {
      log.info(results);
      return results;
    }).catch((err) => {
      log.error(err);
    });
  }

}

module.exports = SettingChannel;
