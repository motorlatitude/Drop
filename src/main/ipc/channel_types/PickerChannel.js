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
   * @param {{type: 'GET_SIZE' | 'MODIFY_SIZE', args: *}} [ipcEventDataObject] the included data
   * @memberof PickerChannel
   */
  constructor(channelProps, ipcEventObject, ipcEventDataObject) {
    super(channelProps.windowManager, channelProps.store, channelProps.tray, channelProps.colorFormats);
    switch (ipcEventDataObject.type) {
      case "GET_SIZE":
        return this.getPickerSize();
      case "MODIFY_SIZE":
        return this.modifyPickerSize(ipcEventDataObject.args);
      default:
        log.warn("UNKNOWN IPC TYPE FOR MOUSE CHANNEL");
        break;
    }
  }

  /**
   * Change the size of the picker
   *
   * @param {*} args
   * @memberof PickerChannel
   */
  modifyPickerSize(args) {
    const pickerSize = this.getPickerSize();

    if (args.zoomType === "increase") {
      this.WindowManager.windows.picker.windowController.pickerSize = pickerSize + 5;
    } else if (args.zoomType === "decrease") {
      this.WindowManager.windows.picker.windowController.pickerSize = pickerSize - 5;
    }
  }

  /**
   * Get the capture picker size from the mouse capture handler instance.
   *
   * @returns {number} Picker size
   * @memberof PickerChannel
   */
  getPickerSize() {
    if (this.WindowManager.windows.picker) {
      return this.WindowManager.windows.picker.windowController.pickerSize;
    }
  }
}

module.exports = PickerChannel;
