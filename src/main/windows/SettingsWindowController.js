/**
 * SettingsWindowController Class
 *
 * Handles the settings window
 * @class SettingsWindowController
 */
class SettingsWindowController {
  /**
   * Creates an instance of SettingsWindowController.
   * @param {WindowManager} wm the WindowManager instance for the application
   * @memberof SettingsWindowController
   */
  constructor(wm) {
    this.window = null;
    this._windowManager = wm;
    this.createWindow(wm);
  }

  /**
   * Create a new settings window
   *
   * @param {WindowManager} wm the WindowManager instance for the application
   * @memberof SettingsWindowController
   */
  createWindow(wm) {
    // Create the browser window.
    const settingsWindow = wm.createNewWindow(this, "settings");
    this.window = settingsWindow;
    // and load the index.html of the app.
    this.window.loadFile(__dirname + "./../../views/settings.html");

    this.window.on("closed", e => {
      this.window = null;
    });

    this.window.on("close", e => {
      if (!this._windowManager.isQuitting) {
        e.preventDefault();
        this.window.hide();
      }
    });

    // fix for flashing on windows 10: electron issue #12130
    this.window.on("show", () => {
      setTimeout(() => {
        this.window.setOpacity(1);
      }, 200);
    });

    this.window.on("hide", () => {
      this.window.setOpacity(0);
    });
  }
}

module.exports = SettingsWindowController;
