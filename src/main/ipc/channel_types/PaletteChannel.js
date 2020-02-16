const Channel = require("./Channel");

/**
 * IPC Channel for palette related functionalities
 *
 * @export PaletteChannel
 * @class PaletteChannel
 * @extends {Channel}
 */
class PaletteChannel extends Channel {
  /**
   * Creates an instance of PaletteChannel.
   * @param {{windowManager: WindowManager, store: ElectronStore, tray: ElectronTray, colorFormats: ColorFormats}} channelProps
   * @param {event} ipcEventObject ipc event object
   * @param {{type: 'GET' | 'GET_ALL' | 'SAVE' | 'DELETE', args: *}} [ipcEventDataObject] the included data
   * @memberof PaletteChannel
   */
  constructor(channelProps, ipcEventObject, ipcEventDataObject) {
    super(channelProps.windowManager, channelProps.store, channelProps.tray, channelProps.colorFormats);
    switch (ipcEventDataObject.type) {
      case "GET":
        return this.get(ipcEventDataObject.args);
      case "GET_ALL":
        return this.getAll();
      case "SAVE":
        return this.save(ipcEventDataObject.args);
      case "DELETE":
        return this.delete(ipcEventDataObject.args);
      default:
        console.warn("UNKNOWN IPC TYPE FOR PALETTE CHANNEL");
        break;
    }
  }

  /**
   * Get a specific palette from store. If supplied `paletteId` does not exist `undefined` will be returned
   *
   * @param {string} paletteId
   * @returns {{colors: [string], name: string, id: string}} a object containing the requested palette's properties
   * @memberof PaletteChannel
   */
  get(paletteId) {
    let paletteStore = this.Store.get("palettes", { HISTORY: { colors: [], name: "Color History", id: "HISTORY" } });
    console.log("GET", paletteStore[paletteId]);
    return paletteStore[paletteId];
  }

  /**
   * Get a list of all palettes including the HISTORY palette
   *
   * @returns {Object.<string, {colors: [string], name: string, id: string}>} a dictionary containing all palettes and their stored colors, including HISTORY palette
   * @memberof PaletteChannel
   */
  getAll() {
    let paletteStore = this.Store.get("palettes", { HISTORY: { colors: [], name: "Color History", id: "HISTORY" } });
    console.log("GET_ALL", paletteStore);
    return paletteStore;
  }

  /**
   * Save a new palette into storage
   *
   * @param {{colors:[string], name: string, id: string}} palette serialized palette object
   * @memberof PaletteChannel
   */
  save(palette) {
    let paletteStore = this.Store.get("palettes", { HISTORY: { colors: [], name: "Color History", id: "HISTORY" } });
    paletteStore[palette.id] = { colors: palette.colors, name: palette.name, id: palette.id };
    this.Store.set("palettes", paletteStore);
    return paletteStore[palette.id];
  }

  /**
   * Remove a specified palette from storage
   *
   * @param {string} paletteId the id of the palette to delete
   * @memberof PaletteChannel
   */
  delete(paletteId) {
    let paletteStore = this.Store.get("palettes", { HISTORY: { colors: [], name: "Color History", id: "HISTORY" } });
    delete paletteStore[paletteId];
    this.Store.set("palettes", paletteStore);
    return undefined;
  }
}

module.exports = PaletteChannel;
