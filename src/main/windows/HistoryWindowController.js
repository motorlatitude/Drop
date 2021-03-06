/**
 * Handles the palette window controls
 */
class HistoryWindowController {
  /**
   *
   * @param {WindowManager} wm  The apps window manager instance
   */
  constructor(wm) {
    this.window = null;
    this._windowManager = wm;
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

    this.window.on("closed", () => {
      this.window = null;
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
}

module.exports = HistoryWindowController;
