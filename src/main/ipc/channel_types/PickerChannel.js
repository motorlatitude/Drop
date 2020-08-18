const electron = require("electron");
const { nativeImage, clipboard } = electron;
const log = require("electron-log");
const svg2img = require("svg2img");

const DefaultSettings = require("../../resources/Defaults").defaultSettings;
const Channel = require("./Channel");

/**
 * IPC Channel for picker events
 *
 * @export PickerChannel
 * @class PickerChannel
 * @extends {Channel}
 */
class PickerChannel extends Channel {
  /**
   * Creates an instance of PickerChannel.
   * @param {{windowManager: WindowManager, store: ElectronStore, tray: ElectronTray, colorFormats: ColorFormats}} channelProps
   * @param {event} ipcEventObject ipc event object
   * @param {{type: ('GET_SIZE' | 'MODIFY_SIZE'), args: *}} [ipcEventDataObject] the included data
   * @memberof PickerChannel
   */
  constructor(channelProps, ipcEventObject, ipcEventDataObject) {
    super(
      channelProps.windowManager,
      channelProps.store,
      channelProps.tray,
      channelProps.colorFormats
    );
    console.log(ipcEventDataObject);
    switch (ipcEventDataObject.type) {
      case "GET_SIZE":
        return this.getPickerSize();
      case "MODIFY_SIZE":
        return this.modifyPickerSize(ipcEventDataObject.args);
      case "PICKED":
        return this.newColorPick(ipcEventDataObject.args);
      default:
        log.warn("UNKNOWN IPC TYPE FOR MOUSE CHANNEL");
        break;
    }
  }

  /**
   * A new color has been  picked by the user from the screen
   * @param {{color: string}} args event arguments
   * @return {undefined}
   */
  newColorPick(args) {
    const color = args.color;
    const currentSettings = this.Store.get("settings", DefaultSettings); // TODO: create default settings object
    const paletteStore = this.Store.get("palettes", {
      HISTORY: { colors: [], name: "Color History", id: "HISTORY" }
    });
    const historyStore = paletteStore.HISTORY.colors;
    if (currentSettings.isHistoryLimit) {
      if (historyStore.length > parseInt(currentSettings.historyLimit)) {
        historyStore.shift();
      }
    }
    historyStore.push(color.toUpperCase());
    paletteStore.HISTORY.colors = historyStore;
    this.WindowManager.windows.history.webContents.send(
      "color-history-update",
      color
    );
    this.Store.set("palettes", paletteStore);
    let iconColor = "#fff";
    if (
      currentSettings.showPickedColor === undefined ||
      currentSettings.showPickedColor === true
    ) {
      iconColor = color.toUpperCase();
    }
    const svgIcon =
      '<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 726.58 877"><defs><style>.cls-1{fill:none;stroke:#fff;stroke-miterlimit:10;stroke-width:30px;}.cls-2{fill:#' +
      iconColor +
      ';}</style></defs><title>taskbar_icon</title><path class="cls-1" d="M1194,341.71q3.73,3.65,7.38,7.38a348.29,348.29,0,1,1-499.88,0c2.42-2.49,4.89-4.95,7.38-7.38" transform="translate(-588.1 -77.94)"/><polyline class="cls-1" points="113.35 271.15 120.72 263.78 363.29 21.21 605.85 263.78 613.23 271.15"/><path class="cls-2" d="M674.58,582.8c72.54-48.36,90.37-59,146.36-52,64.49,8.06,120.91,120.91,241.82,120.91,119,0,146.36-60.82,162.48-76.94h0C1225.24,727.5,1102.66,855,949.9,855S674.58,735.56,674.58,582.8Z" transform="translate(-588.1 -77.94)"/></svg>';
    svg2img(svgIcon, (error, image) => {
      if (error) {
        console.err(error);
      }
      console.log("Setting Tray Image");
      this.Tray.setTrayImage(nativeImage.createFromBuffer(image));
    });

    const format = this.ColorFormats.formats.filter(
      f => f.value === this.ColorFormats.selectedFormat
    );
    if (format[0]) {
      const convertedColor = format[0].convertFromHex(color);
      log.log("Selected Color: " + convertedColor);
      clipboard.writeText(convertedColor);
    } else {
      log.error(new Error("Unknown selected format"));
    }

    setTimeout(() => {
      this.WindowManager.windows.picker.hide();
    }, 250);
    return { response: undefined };
  }

  /**
   * Change the size of the picker
   *
   * @param {*} args
   * @return {undefined}
   * @memberof PickerChannel
   */
  modifyPickerSize(args) {
    const pickerSize = this.getPickerSize();

    if (args.zoomType === "increase") {
      this.WindowManager.windows.picker.windowController.pickerSize =
        pickerSize + 5;
    } else if (args.zoomType === "decrease") {
      this.WindowManager.windows.picker.windowController.pickerSize =
        pickerSize - 5;
    }
    return { response: undefined };
  }

  /**
   * Get the capture picker size from the mouse capture handler instance.
   *
   * @return {number} Picker size
   * @memberof PickerChannel
   */
  getPickerSize() {
    if (this.WindowManager.windows.picker) {
      return this.WindowManager.windows.picker.windowController.pickerSize;
    }
    return { response: undefined };
  }
}

module.exports = PickerChannel;
