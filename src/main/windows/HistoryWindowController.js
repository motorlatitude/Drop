const electron = require("electron");

const DefaultSettings = require("../resources/Defaults").defaultSettings;
/**
 * Handles the palette window controls
 */
class HistoryWindowController {
  /**
   *
   * @param {WindowManager} wm  The apps window manager instance
   * @param {Store} store The apps store instance
   */
  constructor(wm, store) {
    this.window = null;
    this._windowManager = wm;
    this._Store = store;
    this._moving = false;

    this.createWindow(wm);
  }

  /**
   * Create a new history window
   *
   * @param {WindowManager} wm the WindowManager instance
   * @memberof HistoryWindowController
   */
  createWindow(wm) {
    // Create the browser window.
    const historyWindow = wm.createNewWindow(this, "history");
    this.window = historyWindow;
    // and load the index.html of the app.
    this.window.loadFile(__dirname + "./../../views/history.html");
    setInterval(() => {
      this.window.setAlwaysOnTop(true);
    }, 10000);

    this.window.on("closed", () => {
      this.window = null;
    });

    this._setBounds();
    this._ConfigureEventListeners();
  }

  /**
   * Sets the windows event listeners
   */
  _ConfigureEventListeners() {
    // save window position on move for future
    this.window.on("move", e => {
      this._moving = setTimeout(() => {
        const currentSettings = this._Store.get("settings", DefaultSettings);
        const b = this.window.getBounds();
        currentSettings.historyWindowBounds = {
          x: b.x,
          y: b.y,
          width: b.width,
          height: b.height
        };
        this._Store.set("settings", currentSettings);
      }, 1000);
    });

    this.window.on("close", e => {
      if (!this._windowManager.isQuitting) {
        e.preventDefault();
        this.window.hide();
      } else {
        this.window = null;
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

  /**
   * Sets the bounds of the window from the settings store
   */
  _setBounds() {
    const currentSettings = this._Store.get("settings", DefaultSettings);
    if (currentSettings.historyWindowBounds !== undefined) {
      if (
        currentSettings.historyWindowBounds.x === 0 &&
        currentSettings.historyWindowBounds.y === 0
      ) {
        this.window.setBounds({
          x:
            electron.screen.getPrimaryDisplay().workArea.x +
            electron.screen.getPrimaryDisplay().workAreaSize.width -
            400,
          y:
            electron.screen.getPrimaryDisplay().workArea.y +
            electron.screen.getPrimaryDisplay().workAreaSize.height -
            210,
          width: currentSettings.historyWindowBounds.width,
          height: currentSettings.historyWindowBounds.height
        });
      } else {
        this.window.setBounds({
          x: currentSettings.historyWindowBounds.x,
          y: currentSettings.historyWindowBounds.y,
          width: currentSettings.historyWindowBounds.width,
          height: currentSettings.historyWindowBounds.height
        });
      }
    }
  }
}

module.exports = HistoryWindowController;
