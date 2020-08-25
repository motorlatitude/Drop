const log = require("electron-log");

const Channel = require("./Channel");

if (process.env.NODE_ENV === "test") {
  log.transports.file.level = false;
  log.transports.console.level = false;
}

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
   * @param {{type: ('GET' | 'GET_ALL' | 'SAVE' | 'DELETE'), args: *}} [ipcEventDataObject] the included data
   * @memberof PaletteChannel
   */
  constructor(channelProps, ipcEventObject, ipcEventDataObject) {
    super(
      channelProps.windowManager,
      channelProps.store,
      channelProps.tray,
      channelProps.colorFormats
    );
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
        log.warn("UNKNOWN IPC TYPE FOR PALETTE CHANNEL");
        break;
    }
  }

  /**
   * Get a specific palette from store. If supplied `paletteId` does not exist `undefined` will be returned
   *
   * @param {string} paletteId
   * @return {{colors: [string], name: string, id: string}} a object containing the requested palette's properties
   * @memberof PaletteChannel
   */
  get(paletteId) {
    const paletteStore = this.Store.get("palettes", {
      HISTORY: { colors: [], name: "Color History", id: "HISTORY" }
    });
    log.debug("GET", paletteStore[paletteId]);
    return paletteStore[paletteId];
  }

  /**
   * Get a list of all palettes including the HISTORY palette
   *
   * @return {Object.<string, {colors: [string], name: string, id: string}>} a dictionary containing all palettes and their stored colors, including HISTORY palette
   * @memberof PaletteChannel
   */
  getAll() {
    const paletteStore = this.Store.get("palettes", {
      HISTORY: { colors: [], name: "Color History", id: "HISTORY" }
    });
    log.debug("GET_ALL", paletteStore);
    return paletteStore;
  }

  /**
   * Save a new palette into storage
   *
   * @param {{colors:[string], name: string, id: string}} palette serialized palette object
   * @param {string} palette.name the name of the palette
   * @param {string} palette.id the id of the palette
   * @param {[string]} palette.colors all colors inside the palette, using hex format without a hash prefacing
   * @return {{colors:[string], name: string, id: string}} returns the same palette object that was inputted
   * @memberof PaletteChannel
   */
  save(palette) {
    const paletteStore = this.Store.get("palettes", {
      HISTORY: { colors: [], name: "Color History", id: "HISTORY" }
    });
    paletteStore[palette.id] = {
      colors: palette.colors,
      name: palette.name,
      id: palette.id
    };
    this.Store.set("palettes", paletteStore);
    if (palette.refresh === true) {
      this.WindowManager.windows.history.webContents.send(
        "refresh-palettes",
        {}
      );
    }
    return paletteStore[palette.id];
  }

  /**
   * Remove a specified palette from storage
   *
   * @param {string} paletteId the id of the palette to delete
   * @return {undefined}
   * @memberof PaletteChannel
   */
  delete(paletteId) {
    const paletteStore = this.Store.get("palettes", {
      HISTORY: { colors: [], name: "Color History", id: "HISTORY" }
    });
    delete paletteStore[paletteId];
    this.Store.set("palettes", paletteStore);
    return { response: undefined };
  }
}

module.exports = PaletteChannel;
