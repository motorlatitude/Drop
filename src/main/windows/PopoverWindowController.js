const electron = require('electron');
const { ipcMain } = electron;

class PopoverWindowController {

  /**
   *
   * @param {WindowManager} wm The apps window manager
   */
  constructor(wm, options, position) {
    this._windowId = Math.random().toString(36).substr(2, 9);
    this.window = null;
    this.windowManager = wm;
    this.createWindow(wm, options, position);
  }

  /**
   * Create a new popover window
   * @param {WindowManager} wm the apps window manager
   * @param {[{clickHandler: function, title: string, sub_title: string, icon: string, isSeparator: boolean, value: string}]} [options] popover window option items
   * @param {{x: number, y: number}} [position] the position of the popover
   */
  createWindow(wm, options, position) {
    this.window = wm.createNewWindow("popover");
    if (position) {
      this.setPosition(position);
    }
    if (options) {
      this.window.webContents.on("did-finish-load", (evt) => {
        this.setOptions(options);
      });
    }
    this.window.loadURL('file://' + __dirname + '/../../views/popover.html');
    this._ConfigureEventListeners();
    console.log("Created New Popover and loaded URL");
  }

  /**
   * Set popover position
   * @param {{x: number, y: number}} bounds the x and y co-ord of the new position of the popover
   */
  setPosition(bounds) {
    this.window.setBounds({
      x: bounds.x,
      y: bounds.y
    });
  }

  /**
   * Set option items for this popover window
   * @param {[{clickHandler: function, title: string, sub_title: string, icon: string, isSeparator: boolean, value: string}]} [options] popover window option items
   */
  setOptions(options) {
    const opts = options.map((val) => {
      val._id = Math.random().toString(36).substr(2, 15);
      if (!val.isSeparator) {
        ipcMain.on("options-"+this._windowId+"-click-"+val._id, (evt, args) => {
          val.clickHandler(args);
        });
      }
      return val;
    });
    this.window.webContents.send("options", {
      id: this._windowId,
      options: opts
    });
  }

  /**
   * Sets PopoverWindow's event listeners
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
      this.windowManager.windows.history.send("popover-hidden");
    });

    this.window.on('close', (e) => {
      e.preventDefault();
      this.window.hide();
    });

    this.window.on('blur', () => {
      this.window.hide();
    });
  }
}

module.exports = PopoverWindowController;
