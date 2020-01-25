const { remote, ipcRenderer } = require('electron');

/**
 * Popover window, use primarily for drop downs such as the color type selection
 */
class PopoverWindowController {

  /**
   * Initiate a new PopoverWindowController, in charge of handling a new popover window
   * @param {BrowserWindow} parentWindow
   * @param {[{clickHandler: function, title: string, sub_title: string, icon: string, isSeparator: boolean, value: string}]} options options should be an
   * array of objects
   */
  constructor(parentWindow, options) {
    this.isVisible = false;
    this.WindowBox = new remote.BrowserWindow({
      width: 340,
      height: 260,
      show: false,
      frame: false,
      background: "#00000000",
      transparent: true,
      resizable: false,
      alwaysOnTop: true,
      parent: parentWindow,
      webPreferences: {
          nodeIntegration: true,
          experimentalFeatures: true
      }
    });
    this._WindowId = Math.random().toString(36).substr(2, 9);
    this._ConfigureEventListeners();
    this.WindowBox.webContents.on("did-finish-load", (evt) => {
      const opts = options.map((val) => {
        val._id = Math.random().toString(36).substr(2, 15);
        if (!val.isSeparator) {
          ipcRenderer.on("options-"+this._WindowId+"-click-"+val._id, (evt, args) => {
            val.clickHandler(args);
          });
        }
        return val;
      });
      ipcRenderer.sendTo(this.WindowBox.webContents.id, "options", {
        id: this._WindowId,
        originatingWebContentId: remote.getCurrentWindow().webContents.id,
        options: opts
      });
    });
    this.WindowBox.loadURL('file://' + __dirname + '/../../views/popover.html');
  }

  /**
   * Sets PopoverWindow's event listeners
   */
  _ConfigureEventListeners() {
    // Fix for window flashing on windows 10: electron issue #12130
    this.WindowBox.on('show', () => {
        setTimeout(() => {
          this.WindowBox.setOpacity(1);
          this.isVisible = true;
        }, 200);
    });

    this.WindowBox.on('hide', () => {
      this.WindowBox.setOpacity(0);
      this.isVisible = false;
    });

    this.WindowBox.on('blur', () => {
      this.WindowBox.hide();
      setTimeout(() => {
          this.isVisible = false;
      },500);
    });
  }

}

module.exports = PopoverWindowController;
