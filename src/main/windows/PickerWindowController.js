const MouseCaptureHandler = require("../resources/MouseCaptureHandler");

/**
 * PickerWindowController Class
 *
 * Handles the magnification picker window
 */
class PickerWindowController {
  /**
   * @constructor
   * @param {WindowManager} wm the WindowManager instance for the app
   * @param {Store} store the Store instance
   */
  constructor(wm, store) {
    this.window = null;
    this._MouseCaptureHandler = new MouseCaptureHandler(wm, store, this);
    this._Store = store;
    this.createWindow(wm);
    this.isVisible = false;
  }

  /**
   * Get the picker size of the mouse capture handler
   *
   * @memberof PickerWindowController
   */
  get pickerSize() {
    return this._MouseCaptureHandler.PickerSize;
  }

  /**
   * Set the new size of the picker, this will also adjust the bounds of the
   * picker window
   * @param {number} size the new size of the picker should be between 12 and 27
   * @memberof PickerWindowController
   */
  set pickerSize(size) {
    if (size <= 27 && size >= 12 && this.window !== null) {
      this._MouseCaptureHandler.PickerSize = size;
      this.window.setBounds({ width: size * 15, height: size * 15 }, false);
      this._MouseCaptureHandler.forceCapture(); // force redraw of lens on picker size change
    }
  }

  /**
   * Creates a new picker window
   * @param {WindowManager} wm the WindowManager instance for the app
   */
  createWindow(wm) {
    this.window = wm.createNewWindow(this, "picker");

    this.window.setBounds({
      width: 255,
      height: 255
    });
    setInterval(() => {
      this.window.setAlwaysOnTop(true);
    }, 10000);
    this.window.setVisibleOnAllWorkspaces(true);
    this.window.setSkipTaskbar(true);
    this.window.loadFile(__dirname + "./../../views/index.html");

    this.window.on("closed", () => {
      this.window = null;
      if (this._MouseCaptureHandler !== null) {
        this._MouseCaptureHandler.stopPolling();
      }
    });

    this._ConfigureEventListeners();
  }

  /**
   * Sets PickerWindow's event listeners
   */
  _ConfigureEventListeners() {
    // Fix for window flashing on windows 10: electron issue #12130
    this.window.on("show", () => {
      setTimeout(() => {
        this.window.setOpacity(1);
        this.isVisible = true;
      }, 100);
      if (this._MouseCaptureHandler !== null) {
        this._MouseCaptureHandler.startPolling();
      }
    });

    this.window.on("hide", () => {
      this.window.setOpacity(0);
      this.isVisible = false;
      if (this._MouseCaptureHandler !== null) {
        this._MouseCaptureHandler.stopPolling();
      }
    });

    this.window.on("close", e => {
      if (!this.windowManager.isQuitting) {
        e.preventDefault();
        this.window.hide();
        this.isVisible = false;
      } else {
        this.isVisible = false;
        this.window = null;
      }
      if (this._MouseCaptureHandler !== null) {
        this._MouseCaptureHandler.stopPolling();
      }
    });
    this.window.on("closed", e => {
      if (this._MouseCaptureHandler !== null) {
        this._MouseCaptureHandler.stopPolling();
      }
      this.isVisible = false;
      this.window = null;
    });

    this.window.on("blur", () => {
      this.window.hide();
      this.isVisible = false;
      if (this._MouseCaptureHandler !== null) {
        this._MouseCaptureHandler.stopPolling();
      }
    });
  }
}

module.exports = PickerWindowController;
