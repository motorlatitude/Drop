const { globalShortcut } = require("electron");
const log = require("electron-log");

class ShortcutController {
  constructor() {
    this._GlobalShortcuts = {};
  }

  /**
   * Register a new global shortcut for the app
   * @param {string} shortcut The shortcut sequence to register
   * @param {void} callback The method to carry out if the shortcut is triggered
   */
  setGlobalShortcut(shortcut, callback) {
    this._GlobalShortcuts[shortcut] = globalShortcut.register(shortcut, callback);
    if (!this._GlobalShortcuts[shortcut]) {
      log.error(new Error("Failed to register new global picker shortcut", shortcut));
    } else {
      log.info(
        "Global picker shortcut was successfully registered: ",
        globalShortcut.isRegistered("CommandOrControl+I")
      );
    }
  }

  /**
   * Unregister all global shortcuts set by this app
   */
  unsetAllGlobalShortcuts() {
    globalShortcut.unregisterAll();
  }
}

module.exports = ShortcutController;
