const { globalShortcut } = require("electron");
const log = require("electron-log");
const KeyAssignment = require("../resources/KeyAssignment");
/**
 * ShortcutController Class
 *
 * Handles the assignment and un-assigning of global shortcuts via
 * electrons globalShortcut API
 *
 * @class ShortcutController
 */
class ShortcutController {
  /**
   * Creates an instance of ShortcutController.
   * @memberof ShortcutController
   */
  constructor() {
    this._GlobalShortcuts = {};
  }

  /**
   * Set all enabled global shortcuts
   * @param {{key: string, shortcut: string[], callback: void, enabled: boolean}} shortcutObjects a list of all available shortcuts
   */
  setAllGlobalShortcuts(shortcutObjects) {
    Object.keys(shortcutObjects).forEach(shortcutKey => {
      const shortcut = shortcutObjects[shortcutKey];
      if (shortcut.enabled) {
        log.info("Setting Global Shortcut:", shortcutKey);
        this.setGlobalShortcut(
          KeyAssignment.format(shortcut.shortcut),
          shortcut.callback
        );
      }
    });
  }

  /**
   * Register a new global shortcut for the app
   * @param {string} shortcut The shortcut sequence to register
   * @param {void} callback The method to carry out if the shortcut is triggered
   */
  setGlobalShortcut(shortcut, callback) {
    this._GlobalShortcuts[shortcut] = globalShortcut.register(
      shortcut,
      callback
    );
    if (!this._GlobalShortcuts[shortcut]) {
      log.error(
        new Error("Failed to register new global picker shortcut", shortcut)
      );
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
