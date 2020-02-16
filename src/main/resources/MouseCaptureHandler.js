const robot = require("robotjs"); // => /!\ when installing robotjs add --target={electron version} flag
const electron = require("electron");
const log = require("electron-log");

class MouseCaptureHandler {
  constructor(wm, pwc) {
    this._WindowManager = wm;
    this._PickerWindowController = pwc;

    this._PollingInterval = null;
    this._PreviousMousePosition = { x: 0, y: 0 };
    this._PickerSize = 17;
  }

  /**
   * Start following cursor and taking screenshots
   */
  startPolling() {
    log.log("Starting Polling");
    this._PollingInterval = setInterval(this._mouseCapture.bind(this), 16);
  }

  /**
   * Stop following cursor (stop polling interval)
   */
  stopPolling() {
    if (this._PollingInterval !== null) {
      log.log("Stopping Polling");
      clearInterval(this._PollingInterval);
      this._PollingInterval = null;
    }
  }

  /**
   * Force a new mouse capture to occur outside of polling. Essentially forces a redraw of the magnifier
   *
   * @memberof MouseCaptureHandler
   */
  forceCapture() {
    this._mouseCapture(true);
  }

  /**
   * Check if capturing should be taking place
   */
  _shouldCapture(ignore = false) {
    if (ignore) {
      return true;
    } else {
      if (
        !this._WindowManager.isQuitting &&
        this._WindowManager.windows.picker &&
        this._PickerWindowController.isVisible
      ) {
        const currentMousePosition = robot.getMousePos();
        if (
          this._PreviousMousePosition.x !== currentMousePosition.x ||
          this._PreviousMousePosition.y !== currentMousePosition.y
        ) {
          this._PreviousMousePosition.x = currentMousePosition.x;
          this._PreviousMousePosition.y = currentMousePosition.y;
          return true;
        }
        return false;
      }
      return false;
    }
  }

  _mouseCapture(ignoreChecks = false) {
    if (this._shouldCapture(ignoreChecks)) {
      // capture small screenshot around mouse cursor position
      var img = robot.screen.capture(
        Math.ceil(this._PreviousMousePosition.x - this._PickerSize / 2),
        Math.ceil(this._PreviousMousePosition.y - this._PickerSize / 2),
        this._PickerSize,
        this._PickerSize
      );
      let multi = img.width / this._PickerSize;
      // get current screen
      let currentScreen = electron.screen.getDisplayNearestPoint({
        x: this._PreviousMousePosition.x,
        y: this._PreviousMousePosition.y
      });
      let factor = currentScreen.scaleFactor;
      let workAreaSize = currentScreen.workArea;
      // scale windows X and Y coords to display
      let windowX = Math.floor(this._PreviousMousePosition.x / factor) - 20;
      let windowY = Math.floor(this._PreviousMousePosition.y / factor) - 20;
      if (workAreaSize.width < this._PreviousMousePosition.x / factor - workAreaSize.x + this._PickerSize * 15) {
        windowX = Math.floor(this._PreviousMousePosition.x / factor) - (this._PickerSize * 15 - 20);
      }
      if (
        workAreaSize.height <
        this._PreviousMousePosition.y / factor - workAreaSize.y + (this._PickerSize * 15 - 90)
      ) {
        windowY = Math.floor(this._PreviousMousePosition.y / factor) - (this._PickerSize * 15 - 20);
      }
      this._WindowManager.windows.picker.setBounds(
        {
          x: windowX,
          y: windowY,
          width: this._PickerSize * 15,
          height: this._PickerSize * 15
        },
        false
      );
      let colors = {};
      for (var k = 0; k < this._PickerSize; k++) {
        colors[k] = [];
        for (var l = 0; l < this._PickerSize; l++) {
          var hex = img.colorAt(l * multi, k * multi);
          colors[k].push({
            x: 6 + k,
            y: 6 + l,
            color: hex
          });
        }
      }
      this._WindowManager.windows.picker.webContents.send("color", JSON.stringify(colors));
    }
  }
}

module.exports = MouseCaptureHandler;
