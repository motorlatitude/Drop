
class Channel {
/**
 *Creates an instance of Channel.
 * @param {*} windowManager the apps window manager instance
 * @param {*} store the apps store
 * @param {*} tray the apps tray
 * @param {*} colorFormats the color format instance
 * @memberof Channel
 */
constructor(windowManager, store, tray, colorFormats) {

    /** @property {WindowManager} WindowManager the apps window manager */
    this.WindowManager = windowManager;

    /** @property {ElectronStore} Store the apps store */
    this.Store = store;

    /** @property {ElectronTray} Tray the apps tray */
    this.Tray = tray;

    /** @property {ColorFormats} ColorFormats the color format instance for the app */
    this.ColorFormats = colorFormats;
  }

}

module.exports = Channel;
