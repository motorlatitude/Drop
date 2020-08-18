const robot = require("robotjs"); // => /!\ when installing robotjs add --target={electron version} flag
const electron = require("electron");
const log = require("electron-log");

/**
 * MouseCaptureHandler Class
 *
 * Handles taking screenshots around the mouse cursor and sending them to the
 * renderer in a grid
 * @class MouseCaptureHandler
 */
class MouseCaptureHandler {
  /**
   * Creates an instance of MouseCaptureHandler.
   * @param {*} wm
   * @param {*} pwc
   * @memberof MouseCaptureHandler
   */
  constructor(wm, pwc) {
    this.PickerSize = 17;

    this._WindowManager = wm;
    this._PickerWindowController = pwc;

    this._PollingInterval = null;
    // this._PollingInterval2 = null;
    this._PreviousMousePosition = { x: 0, y: 0 };
    this._PreviousImage = null;
  }

  /**
   * Start following cursor and taking screenshots
   */
  startPolling() {
    log.log("Starting Polling");
    robot.setMouseDelay(0);
    this._PollingInterval = setInterval(this._mouseCapture.bind(this), 0);
    // this._PollingInterval2 = setInterval(this._windowMovement.bind(this), 0);
  }

  /**
   * Stop following cursor (stop polling interval)
   */
  stopPolling() {
    if (this._PollingInterval !== null) {
      log.log("Stopping Polling");
      clearInterval(this._PollingInterval);
      this._PollingInterval = null;
      // clearInterval(this._PollingInterval2);
      // this._PollingInterval2 = null;
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
   * Checks if a new screenshot should be taken based on if the picker is
   * visible and if the mouse position has moved since the last capture
   *
   * @param {boolean} [ignore=false] should the capture check be ignored
   * @return {boolean}
   * @memberof MouseCaptureHandler
   */
  _shouldCapture(ignore = false) {
    if (ignore) {
      return true;
    }

    if (
      this._WindowManager.isQuitting &&
      !this._WindowManager.windows.picker &&
      !this._PickerWindowController.isVisible
    ) {
      return false;
    }

    const currentMousePosition = robot.getMousePos();
    if (
      this._PreviousMousePosition.x === currentMousePosition.x &&
      this._PreviousMousePosition.y === currentMousePosition.y
    ) {
      return false;
    }

    this._PreviousMousePosition.x = currentMousePosition.x;
    this._PreviousMousePosition.y = currentMousePosition.y;
    return true;
  }

  /**
   * Move window with cursor
   * @param {boolean} [ignoreChecks = false] should checks be ignored
   * @return {boolean}
   */
  _windowMovement(ignoreChecks = false) {
    return setImmediate(() => {
      if (!this._shouldCapture(ignoreChecks)) {
        return false;
      }
      // get current screen
      const currentScreen = electron.screen.getDisplayNearestPoint({
        x: this._PreviousMousePosition.x,
        y: this._PreviousMousePosition.y
      });
      const factor = currentScreen.scaleFactor;
      const workAreaSize = currentScreen.workArea;
      // scale windows X and Y coords to display
      let windowX = Math.floor(this._PreviousMousePosition.x / factor) - 20;
      let windowY = Math.floor(this._PreviousMousePosition.y / factor) - 20;
      if (
        workAreaSize.width <
        this._PreviousMousePosition.x / factor -
          workAreaSize.x +
          this.PickerSize * 15
      ) {
        windowX =
          Math.floor(this._PreviousMousePosition.x / factor) -
          (this.PickerSize * 15 - 20);
      }
      if (
        workAreaSize.height <
        this._PreviousMousePosition.y / factor -
          workAreaSize.y +
          this.PickerSize * 15 -
          20
      ) {
        windowY =
          Math.floor(this._PreviousMousePosition.y / factor) -
          (this.PickerSize * 15 - 20);
      }
      this._WindowManager.windows.picker.setBounds(
        {
          x: windowX,
          y: windowY,
          width: this.PickerSize * 15,
          height: this.PickerSize * 15
        },
        false
      );
      return true;
    });
  }

  /**
   * Capture an area around the mouse cursor and send a grid to the render process
   * BUG: RobotJS bug that causes segmentation faults to occur when user moves cursor to edge of screen in linux
   * @param {boolean} [ignoreChecks=false] should capture checks be ignored
   * @memberof MouseCaptureHandler
   */
  _mouseCapture(ignoreChecks = false) {
    if (this._shouldCapture(ignoreChecks)) {
      this._windowMovement(ignoreChecks);
      // get current screen
      const currentScreen = electron.screen.getDisplayNearestPoint({
        x: this._PreviousMousePosition.x,
        y: this._PreviousMousePosition.y
      });
      const factor = currentScreen.scaleFactor;
      const workAreaSize = currentScreen.workArea;

      // capture small screenshot around mouse cursor
      // keep capture within desktop limits to avoid segfault crash
      let captureX = this._PreviousMousePosition.x;
      let captureY = this._PreviousMousePosition.y;
      if (
        Math.ceil(this._PreviousMousePosition.x / factor) - workAreaSize.x >=
        workAreaSize.width - Math.ceil(this.PickerSize / 2)
      ) {
        captureX = workAreaSize.width - Math.floor(this.PickerSize / 2);
      } else if (this._PreviousMousePosition.x <= this.PickerSize / 2) {
        captureX = this.PickerSize / 2;
      }
      if (
        Math.ceil(this._PreviousMousePosition.y / factor) - workAreaSize.y >=
        workAreaSize.height - Math.ceil(this.PickerSize / 2)
      ) {
        captureY = workAreaSize.height - Math.floor(this.PickerSize / 2);
      } else if (this._PreviousMousePosition.y <= this.PickerSize / 2) {
        captureY = this.PickerSize / 2;
      }

      this._PreviousImage = robot.screen.capture(
        Math.ceil(captureX - this.PickerSize / 2),
        Math.ceil(captureY - this.PickerSize / 2),
        this.PickerSize,
        this.PickerSize
      );
      const img = this._PreviousImage;
      const multi = img.width / this.PickerSize;
      const colors = {};
      for (let k = 0; k < this.PickerSize; k++) {
        colors[k] = [];
        for (let l = 0; l < this.PickerSize; l++) {
          const hex = img.colorAt(l * multi, k * multi);
          colors[k].push({
            x: 6 + k,
            y: 6 + l,
            color: hex
          });
        }
      }
      this._WindowManager.windows.picker.webContents.send("color", colors);
    }
  }
}

module.exports = MouseCaptureHandler;
