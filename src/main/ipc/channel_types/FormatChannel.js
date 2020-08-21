const log = require("electron-log");
const fs = require("fs");
const path = require("path");
const requireFromString = require("require-from-string");
const { dialog } = require("electron");

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
      case "GET_ALL":
        return this.getAllFormats();
      case "SAVE_FORMAT":
        return this.saveFormat(ipcEventDataObject.args);
      case "DELETE_FORMAT":
        return this.deleteFormat(ipcEventDataObject.args);
      default:
        log.warn("UNKNOWN IPC TYPE FOR FORMAT CHANNEL");
        break;
    }
  }

  /**
   * delete a formats plugin
   * @param {{value: string}} args the name of the plugin to be removed as an object
   */
  deleteFormat(args) {
    const pluginPath = path.resolve(
      __dirname + "/../../resources/formats/" + args.value + ".js"
    );
    if (fs.existsSync(pluginPath)) {
      fs.unlinkSync(pluginPath); // delete old plugin file
    } else {
      log.debug(
        "Failed to delete plugin format as plugin does not exists at path",
        pluginPath
      );
    }
  }

  /**
   * Save a new or existing formats code
   * @param {{value: string, file: string, new: boolean}} args the supplied arguments to write a format
   * @return {{saved: boolean}} returns boolean if saved successfully or unsuccessfully
   */
  saveFormat(args) {
    const pluginFormat = requireFromString(args.file);
    if (pluginFormat.config().name && pluginFormat.config().type === "format") {
      if (args.new) {
        const matchingName = this.ColorFormats.formats.filter(
          f => f.value === pluginFormat.config().name
        );
        if (matchingName[0]) {
          log.error("Color format with that name already exists");
          dialog.showErrorBox(
            "Failed to save format",
            "A format with this name already exists"
          );
        }
      }
      try {
        const hexColor = "#ffffff";
        const r = parseInt("0x" + hexColor.substring(0, 2));
        const g = parseInt("0x" + hexColor.substring(2, 4));
        const b = parseInt("0x" + hexColor.substring(4, 6));
        const colorObject = pluginFormat.convertColor({
          hex: hexColor,
          rgb: {
            r,
            g,
            b
          }
        });
        if (colorObject) {
          const pluginPath = path.resolve(
            __dirname +
              "/../../resources/formats/" +
              pluginFormat.config().name +
              ".js"
          );
          if (pluginFormat.config().name !== args.value) {
            // modified name, remove old and create new
            fs.unlinkSync(
              path.resolve(
                __dirname + "/../../resources/formats/" + args.value + ".js"
              )
            ); // delete old plugin file
          }
          fs.writeFile(pluginPath, args.file, err => {
            if (err) {
              log.error(err);
              return { saved: false };
            } else {
              this.ColorFormats.updateFormats(formats => {
                if (this.WindowManager.windows.settings) {
                  this.WindowManager.windows.settings.webContents.send(
                    "FORMATS_UPDATED",
                    formats
                  );
                }
                if (this.WindowManager.windows.history) {
                  const selectedFormat = formats.filter(
                    f => f.value === this.ColorFormats.selectedFormat
                  )[0];
                  if (selectedFormat) {
                    this.WindowManager.windows.history.webContents.send(
                      "color-type-change",
                      {
                        name: selectedFormat.title,
                        icon: selectedFormat.icon
                      }
                    );
                  } else {
                    // currently selected color format no longer exists
                    this.ColorFormats.selectedFormat = formats[0].value;
                    this.WindowManager.windows.history.webContents.send(
                      "color-type-change",
                      {
                        name: formats[0].title,
                        icon: formats[0].icon
                      }
                    );
                  }
                }
                if (this.WindowManager.windows.popover) {
                  const popoverItems = JSON.parse(
                    JSON.stringify(this.ColorFormats.formats)
                  );
                  this.WindowManager.windows.popover.windowController.setOptions(
                    popoverItems
                  );
                  return popoverItems;
                }
                return { saved: true };
              });
              return { saved: false };
            }
          });
          return { saved: false };
        } else {
          log.error(
            "Invalid file format, plugin does not convert hex color correctly"
          );
          dialog.showErrorBox(
            "Failed to save format",
            "The created custom color format does not convert color correctly"
          );
          return { saved: false };
        }
      } catch (err) {
        log.error(err);
        return { saved: false };
      }
    } else {
      log.error(
        "Failed to load plugin, plugin does not have a valid name or is not of the correct type"
      );
      dialog.showErrorBox(
        "Failed to save format",
        "The created custom color format does not have a valid name or is not of the correct type"
      );
      return { saved: false };
    }
  }

  /**
   * Returns all available color formats in an array
   * @return {[*]} color formats array
   */
  getAllFormats() {
    return JSON.parse(JSON.stringify(this.ColorFormats.formats));
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
