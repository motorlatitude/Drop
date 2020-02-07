
/**
 * PickerWindowController Class
 *
 * Handles the magnification picker window
 */
class PickerWindowController {

  /**
   * @constructor
   * @param {WindowManager} wm the WindowManager instance for the app
   */
  constructor(wm) {
    this.window = null;
    this.createWindow(wm);
  }

  /**
   * Creates a new picker window
   * @param {WindowManager} wm the WindowManager instance for the app
   */
  createWindow(wm) {
    this.window = wm.createNewWindow("picker");

    this.window.setBounds({
      width: 255,
      height: 255,
    });
    this.window.setAlwaysOnTop(true, "floating");
    this.window.setVisibleOnAllWorkspaces(true);
    this.window.setSkipTaskbar(true);
    this.window.loadFile(__dirname + './../../views/index.html');

    this.window.on('closed', () => {
      this.window = null;
    });

    this._ConfigureEventListeners();
  }

   /**
   * Sets PickerWindow's event listeners
   */
  _ConfigureEventListeners() {
    // Fix for window flashing on windows 10: electron issue #12130
    this.window.on('show', () => {
        setTimeout(() => {
          this.window.setOpacity(1);
          this.isVisible = true;
        }, 100);
    });

    this.window.on('hide', () => {
      this.window.setOpacity(0);
    });
/*
    this.window.on('close', (e) => {
      if (!this.windowManager.isQuitting) {
        e.preventDefault();
        this.window.hide();
      } else {
        this.window = null;
      }
    });
*/
    this.window.on('closed', (e) => {
      this.window.destroy();
      this.window = null;
    });

    this.window.on('blur', () => {
      this.window.hide();
    });
  }

}

module.exports = PickerWindowController;
