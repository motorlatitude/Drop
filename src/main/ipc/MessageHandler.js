const electron = require('electron');
const {ipcMain, nativeImage, screen, app} = electron;
const svg2png = require('svg2png');
const SettingsWindowController = require('../windows/SettingsWindowController');
const PopoverWindowController = require('../windows/PopoverWindowController');

/**
 * MessageHandler Class
 *
 * Handles IPC with render process
 */
class MessageHandler {

  /**
   * Initiates new main process IPC Message Handler
   * @param {[BrowserWindow]} w an array of all the different windows
   * @param {*} s the electron-store
   * @param {*} t the electron tray
   */
  constructor(wm, s, t) {
    this.windowManager = wm;
    this.windows = this.windowManager.windows;
    this.store = s;
    this.tray = t;
  }

  /**
   * Setup listeners for expected incoming IPC messages
   */
  setupListeners() {
    let self = this;

    // History Window IPCs
    ipcMain.handle("get-palettes", this.fetchPalettes.bind(self));
    ipcMain.on("save-palette", this.savePalette.bind(self));
    ipcMain.on("delete-palette", this.deletePalette.bind(self));
    ipcMain.on("modify-bounds", this.modifyWindowBounds.bind(self));

    ipcMain.handle("get-bounds", this.getWindowBounds.bind(self));
    ipcMain.handle("get-primary-screen-size", this.getScreenSize.bind(self));

    ipcMain.on("show-formats", this.openFormatsPopover.bind(self));
    ipcMain.handle("get-formats-state", this.stateFormatsPopover.bind(self));

    ipcMain.on("show-settings", this.openSettings.bind(self));
    ipcMain.on("quit-app", this.quitApp.bind(self));
    ipcMain.on("hide-window", this.hideWindow.bind(self));
    // Magnifier Window IPCs
    ipcMain.on("clicked", this.newColorPick.bind(self));
  }

  /**
   *
   * @param {event} evt IPC event object
   * @param {string} windowName name of window to hide
   */
  hideWindow(evt, windowName) {
    this.windowManager.windows[windowName].hide();
  }

  /**
   * Is color format dropdown visible
   */
  stateFormatsPopover() {
    if (this.windowManager.popover) {
      return this.windowManager.popover.isVisible();
    } else {
      return false;
    }
  }

  /**
   * Shows dropdown menu for other colour formats
   */
  openFormatsPopover() {
    if (this.windowManager.windows.popover) {
      this.windowManager.windows.popover.show();
    } else {
      const colorFormats = [{
        clickHandler: (colorType) => {
          let ct = {
              type: colorType,
              name: "CSS Hex",
              icon: "css"
          };
          this.windowManager.windows.history.webContents.send("color-type-change", ct);
        },
        title: "CSS Hex",
        sub_title: "#rrggbb",
        icon: "css",
        isSeparator: false,
        value: "css_hex"
      }, {
        isSeparator: true
      }, {
        clickHandler: (colorType) => {
          let ct = {
              type: colorType,
              name: "CSS HSL",
              icon: "css_2"
          };
          this.windowManager.windows.history.webContents.send("color-type-change", ct);
        },
        title: "CSS HSL",
        sub_title: "hsl(hue, sat%, light%)",
        icon: "css_2",
        isSeparator: false,
        value: "css_hsl"
      }, {
        clickHandler: (colorType) => {
          let ct = {
              type: colorType,
              name: "CSS HSLA",
              icon: "css_2"
          };
          this.windowManager.windows.history.webContents.send("color-type-change", ct);
        },
        title: "CSS HSLA",
        sub_title: "hsl(hue, sat%, light%, alpha)",
        icon: "css_2",
        isSeparator: false,
        value: "css_hsla"
      }, {
        clickHandler: (colorType) => {
          let ct = {
              type: colorType,
              name: "CSS RGB",
              icon: "css_2"
          };
          this.windowManager.windows.history.webContents.send("color-type-change", ct);
        },
        title: "CSS RGB",
        sub_title: "rgb(rrr,ggg,bbb)",
        icon: "css_2",
        isSeparator: false,
        value: "css_rgb"
      }, {
        clickHandler: (colorType) => {
          let ct = {
              type: colorType,
              name: "CSS RGBA",
              icon: "css_2"
          };
          this.windowManager.windows.history.webContents.send("color-type-change", ct);
        },
        title: "CSS RGBA",
        sub_title: "rgba(rrr,ggg,bbb)",
        icon: "css_2",
        isSeparator: false,
        value: "css_rgba"
      }];

      const windowBounds = this.windowManager.windows.history.getBounds();

      let windowY = windowBounds.y + 50;
      let windowScreen = screen.getDisplayNearestPoint({
        x: windowBounds.x,
        y: windowBounds.y
      });
      if(windowY + 260 >= windowScreen.bounds.height){
        windowY = windowY - 260 - 40;
      }
      const w = new PopoverWindowController(this.windowManager, colorFormats, {
        x: windowBounds.x + 30,
        y: windowY});

      w.window.on("ready-to-show", () => {
        w.window.show();
      });
    }
  }

/**
 * QUIT
 */
  quitApp() {
    app.quit();
  }

  /**
   * Opens the Settings Window
   */
  openSettings() {
    const w = new SettingsWindowController(this.windowManager);
    w.window.on("ready-to-show", () => {
      w.window.show();
    });
  }

  /**
   * Get the primary display size
   */
  getScreenSize() {
    return screen.getPrimaryDisplay().workAreaSize;
  }

  /**
   * Get the bounds of a specific window
   * @param {event} evt IPC event object
   * @param {{windowName: string}} opts supplied options containing the window name
   */
  getWindowBounds(evt, opts) {
    if(this.windows[opts.windowName]) {
      const b = this.windows[opts.windowName].getBounds();
      return {
        x: b.x,
        y: b.y,
        width: b.width,
        height: b.height
      };
    }
    return undefined;
  }

  /**
   * Set the bounds for a specific window
   * @param {event} evt IPC event object
   * @param {{windowName: string, animate: boolean, bounds: {x?: number, y?: number, width?: number, height?: number}}} bounds supplied options containing the window name, the new bounds and if changing the bounds should be animated
   */
  modifyWindowBounds(evt, bounds) {
    console.log("Modify Window Bounds")
    if (this.windows[bounds.windowName]) {
      const currentBounds = this.windows[bounds.windowName].getBounds();
      const newBounds = {
        width: bounds.bounds.width ? bounds.bounds.width : currentBounds.width,
        height: bounds.bounds.height ? bounds.bounds.height : currentBounds.height,
        x: bounds.bounds.x ? bounds.bounds.x : currentBounds.x,
        y: bounds.bounds.y ? bounds.bounds.y : currentBounds.y
      };
      this.windows[bounds.windowName].setBounds(newBounds, bounds.animate === true ? bounds.animate : false);
    } else {
      console.error("Couldn't find window", bounds.windowName);
    }
  }

  /**
   * Fetch Palettes From Storage
   */
  fetchPalettes() {
    let paletteStore = this.store.get("palettes", {"HISTORY": {colors:[], name: "Color History", id: "HISTORY"}});
    console.log(paletteStore);
    if (this.windows.history) {
      return paletteStore;
    } else {
      console.error("Request for palettes sent from a window that doesn't exist");
    }
  }

  /**
   * Store a new palette in the electron-store
   * @param {Event} evt IPC event object
   * @param {{colors: [string], name: string, id: string}} palette the new palette to be saved
   */
  savePalette(evt, palette) {
    let paletteStore = this.store.get("palettes", {"HISTORY": {colors:[], name: "Color History", id: "HISTORY"}});
    paletteStore[palette.id] = { colors: palette.colors, name: palette.name, id: palette.id};
    this.store.set('palettes', paletteStore);
  }

  /**
   * Delete a palette from store
   * @param {Event} evt IPC event object
   * @param {string} paletteId the id of the palette to delete
   */
  deletePalette(evt, paletteId) {
    let paletteStore = this.store.get("palettes", {"HISTORY": {colors:[], name: "Color History", id: "HISTORY"}});
    delete paletteStore[paletteId];
    this.store.set('palettes', paletteStore);
  }

  /**
   * A new color has been  picked by the user from the screen
   * @param {Event} evt IPC event object
   * @param {string} color the hex color string of the picked color without the hashtag
   */
  newColorPick(evt, color) {
    const paletteStore = this.store.get("palettes", {"HISTORY": {colors:[], name: "Color History", id: "HISTORY"}});
    const historyStore = paletteStore.HISTORY.colors;
    if(historyStore.length > 30){
      historyStore.shift();
    }
    historyStore.push(color.toUpperCase());
    paletteStore.HISTORY.colors = historyStore;
    this.windows.history.webContents.send("color-history-update", color);
    this.store.set('palettes', paletteStore);
    const icon_SVG = '<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 726.58 877"><defs><style>.cls-1{fill:none;stroke:#fff;stroke-miterlimit:10;stroke-width:30px;}.cls-2{fill:#'+color.toUpperCase()+';}</style></defs><title>taskbar_icon</title><path class="cls-1" d="M1194,341.71q3.73,3.65,7.38,7.38a348.29,348.29,0,1,1-499.88,0c2.42-2.49,4.89-4.95,7.38-7.38" transform="translate(-588.1 -77.94)"/><polyline class="cls-1" points="113.35 271.15 120.72 263.78 363.29 21.21 605.85 263.78 613.23 271.15"/><path class="cls-2" d="M674.58,582.8c72.54-48.36,90.37-59,146.36-52,64.49,8.06,120.91,120.91,241.82,120.91,119,0,146.36-60.82,162.48-76.94h0C1225.24,727.5,1102.66,855,949.9,855S674.58,735.56,674.58,582.8Z" transform="translate(-588.1 -77.94)"/></svg>';
    svg2png(Buffer.from(icon_SVG), {width: 512}).then((image) => {
      this.tray.setTrayImage(nativeImage.createFromBuffer(image));
    }).catch((err) => {
      console.error(err);
    });
  }

}

module.exports = MessageHandler;
