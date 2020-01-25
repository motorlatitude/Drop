const electron = require('electron');
const {ipcMain, nativeImage} = electron;
const svg2png = require('svg2png');

/**
 * Handles IPC communication with render process
 */
class MessageHandler {

  /**
   * Initiates new main process IPC Message Handler
   * @param {[BrowserWindow]} w an array of all the different windows
   * @param {*} s the electron-store
   * @param {*} t the electron tray
   */
  constructor(w, s, t) {
    this.windows = w;
    this.store = s;
    this.tray = t;
  }

  /**
   * Setup listeners for expected incoming IPC messages
   */
  setupListeners() {
    let self = this;

    // History Window IPCs
    ipcMain.on("get-palettes", this.fetchPalettes.bind(self));
    ipcMain.on("save-palette", this.savePalette.bind(self));
    ipcMain.on("delete-palette", this.deletePalette.bind(self));

    // Magnifier Window IPCs
    ipcMain.on("clicked", this.newColorPick.bind(self));
  }

  /**
   * Fetch Palettes From Storage
   */
  fetchPalettes() {
    let paletteStore = this.store.get("palettes", {"HISTORY": {colors:[], name: "Color History", id: "HISTORY"}});
    console.log(paletteStore);
    if (this.windows.history) {
      this.windows.history.window.webContents.send("get-palettes-response", paletteStore);
    } else {
      console.error("Request for palettes sent from a window that doesn't exist");
    }
  }

  /**
   * Store a new palette in the electron-store
   * @param {Event} evt IPC on event object
   * @param {{colors: [string], name: string, id: string}} palette the new palette to be saved
   */
  savePalette(evt, palette) {
    let paletteStore = this.store.get("palettes", {"HISTORY": {colors:[], name: "Color History", id: "HISTORY"}});
    paletteStore[palette.id] = { colors: palette.colors, name: palette.name, id: palette.id};
    this.store.set('palettes', paletteStore);
  }

  /**
   * Delete a palette from store
   * @param {Event} evt IPC on event object
   * @param {string} paletteId the id of the palette to delete
   */
  deletePalette(evt, paletteId) {
    let paletteStore = this.store.get("palettes", {"HISTORY": {colors:[], name: "Color History", id: "HISTORY"}});
    delete paletteStore[paletteId];
    this.store.set('palettes', paletteStore);
  }

  /**
   * A new color has been  picked by the user from the screen
   * @param {Event} evt IPC on event object
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
    this.windows.history.window.webContents.send("color-history-update", color);
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
