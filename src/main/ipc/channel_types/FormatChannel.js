const log = require("electron-log");

const Channel = require("./Channel");

/**
 * IPC Channel for changing format
 *
 * @export FormatChannel
 * @class FormatChannel
 * @extends {Channel}
 */
class FormatChannel extends Channel {
  /**
   * Creates an instance of MouseChannel.
   * @param {{windowManager: WindowManager, store: ElectronStore, tray: ElectronTray, colorFormats: ColorFormats}} channelProps
   * @param {event} ipcEventObject ipc event object
   * @param {{type: 'MOVE', args: *}} [ipcEventDataObject] the included data
   * @memberof MouseChannel
   */
  constructor(channelProps, ipcEventObject, ipcEventDataObject) {
    super(
      channelProps.windowManager,
      channelProps.store,
      channelProps.tray,
      channelProps.colorFormats
    );
    switch (ipcEventDataObject.type) {
      case "NEXT":
        return this.nextFormat();
      case "BACK":
        return this.previousFormat();
      default:
        log.warn("UNKNOWN IPC TYPE FOR FORMAT CHANNEL");
        break;
    }
  }

  /**
   * Select the next available format
   */
  nextFormat() {
    const allColorFormats = this.ColorFormats.formats;
    const currentColorIndex = allColorFormats.indexOf(
      allColorFormats.filter(
        (t, index) => t.value === this.ColorFormats.selectedFormat
      )[0]
    );
    let nextColorIndex = currentColorIndex + 1;
    if (currentColorIndex + 1 > allColorFormats.length - 1) {
      nextColorIndex = 0;
    }
    this.WindowManager.windows.history.webContents.send("color-type-change", {
      type: allColorFormats[nextColorIndex].value,
      name: allColorFormats[nextColorIndex].title,
      icon: allColorFormats[nextColorIndex].icon
    });
    this.ColorFormats.selectedFormat = allColorFormats[nextColorIndex].value;
  }

  /**
   * Select the previous available format
   */
  previousFormat() {
    const allColorFormats = this.ColorFormats.formats;
    const currentColorIndex = allColorFormats.indexOf(
      allColorFormats.filter(
        (t, index) => t.value === this.ColorFormats.selectedFormat
      )[0]
    );
    let previousColorIndex = currentColorIndex - 1;
    if (currentColorIndex - 1 < 0) {
      previousColorIndex = allColorFormats.length - 1;
    }
    this.WindowManager.windows.history.webContents.send("color-type-change", {
      type: allColorFormats[previousColorIndex].value,
      name: allColorFormats[previousColorIndex].title,
      icon: allColorFormats[previousColorIndex].icon
    });
    this.ColorFormats.selectedFormat =
      allColorFormats[previousColorIndex].value;
  }
}

module.exports = FormatChannel;
