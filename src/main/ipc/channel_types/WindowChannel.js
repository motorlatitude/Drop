const electron = require("electron");
const { screen } = electron;
const log = require("electron-log");

const Channel = require("./Channel");
const SettingsWindowController = require("./../../windows/SettingsWindowController");
const PopoverWindowController = require("./../../windows/PopoverWindowController");

/**
 * WindowChannel Class
 *
 * Handles all messages coming from renderer process in the WINDOW IPC channel
 * @class WindowChannel
 * @extends {Channel}
 */
class WindowChannel extends Channel {
  /**
   * Creates an instance of WindowChannel.
   * @param {{windowManager: WindowManager, store: ElectronStore, tray: ElectronTray, colorFormats: ColorFormats}} channelProps
   * @param {event} ipcEventObject ipc event object
   * @param {{type: ('GET_BOUNDS' | 'SET_BOUNDS' | 'SHOW' | 'HIDE' | 'IS_VISIBLE'), windowName: string, args: *}} [ipcEventDataObject] the included data
   * @memberof WindowChannel
   */
  constructor(channelProps, ipcEventObject, ipcEventDataObject) {
    super(
      channelProps.windowManager,
      channelProps.store,
      channelProps.tray,
      channelProps.colorFormats
    );
    switch (ipcEventDataObject.type) {
      case "GET_BOUNDS":
        return this.getBounds(ipcEventDataObject.windowName);
      case "SET_BOUNDS":
        return this.setBounds(
          ipcEventDataObject.windowName,
          ipcEventDataObject.args
        );
      case "SHOW":
        return this.showWindow(ipcEventDataObject.windowName);
      case "HIDE":
        return this.hideWindow(ipcEventDataObject.windowName);
      case "IS_VISIBLE":
        return this.isWindowVisible(ipcEventDataObject.windowName);
    }
  }

  /**
   * Get bounds for a specific window from the window's name
   *
   * @param {string} windowName name of the window to get the bounds for
   * @return {{x: number, y: number, width: number, height: number} | Error} Bounds for the specified window, if window does not exist, returns `Error`
   * @memberof WindowChannel
   */
  getBounds(windowName) {
    if (this.WindowManager.windows[windowName]) {
      const b = this.WindowManager.windows[windowName].getBounds();
      return {
        x: b.x,
        y: b.y,
        width: b.width,
        height: b.height
      };
    }
    return new Error("Could not find window with the name", windowName);
  }

  /**
   * Set bounds for a specific window from the window's name
   *
   * @param {string} windowName name of the window to modify
   * @param {{x: (number|undefined), y: (number|undefined), width: (number|undefined), height: (number|undefined), animate: (boolean|undefined)}} newWindowBounds new bounds
   * @return {({x: number, y: number, width: number, height: number} | Error)} the new bounds of the window or an Error object if the new bounds could not be applied to the specified window
   * @memberof WindowChannel
   */
  setBounds(windowName, newWindowBounds) {
    log.debug(
      "Modifying bounds for window with name '",
      windowName,
      "' to ",
      newWindowBounds
    );
    if (this.WindowManager.windows[windowName]) {
      const currentBounds = this.WindowManager.windows[windowName].getBounds();
      const newBounds = {
        width: newWindowBounds.width || currentBounds.width,
        height: newWindowBounds.height || currentBounds.height,
        x: newWindowBounds.x || currentBounds.x,
        y: newWindowBounds.y || currentBounds.y
      };
      this.WindowManager.windows[windowName].setBounds(
        newBounds,
        newWindowBounds.animate === true ? newWindowBounds.animate : false
      );
      return this.WindowManager.windows[windowName].getBounds();
    }
    return new Error("Could not find window with the name", windowName);
  }

  /**
   * Show a specific window from the window's name
   *
   * @param {string} windowName name of the window to show
   * @return {undefined}
   * @memberof WindowChannel
   */
  showWindow(windowName) {
    if (this.WindowManager.windows[windowName]) {
      if (windowName === "popover") {
        const windowBounds = this.WindowManager.windows.history.getBounds();
        const windowScreen = screen.getDisplayNearestPoint({
          x: windowBounds.x,
          y: windowBounds.y
        });
        let windowY = windowBounds.y + 30 * windowScreen.scaleFactor;
        if (windowY + 260 >= windowScreen.bounds.height) {
          windowY = windowY - (260 - 60) * windowScreen.scaleFactor;
        }
        this.WindowManager.windows.popover.setBounds(
          {
            x: windowBounds.x + 30,
            y: windowY
          },
          false
        );
      }
      this.WindowManager.windows[windowName].show();
      return undefined;
    } else if (windowName === "settings") {
      const w = new SettingsWindowController(this.WindowManager);
      w.window.on("ready-to-show", () => {
        w.window.show();
      });
      return undefined;
    } else if (windowName === "popover") {
      log.debug("Creating Popover Window");

      const popoverItems = this.ColorFormats.formats.map(format => {
        format.clickHandler = () => {
          this.WindowManager.windows.history.webContents.send(
            "color-type-change",
            {
              type: format.value,
              name: format.title,
              icon: format.icon
            }
          );
          this.ColorFormats.selectedFormat = format.value;
        };
        return format;
      });

      const windowBounds = this.WindowManager.windows.history.getBounds();
      const windowScreen = screen.getDisplayNearestPoint({
        x: windowBounds.x,
        y: windowBounds.y
      });
      let windowY = windowBounds.y + 30 * windowScreen.scaleFactor;
      if (windowY + 260 >= windowScreen.bounds.height) {
        windowY = windowY - (260 - 60) * windowScreen.scaleFactor;
      }
      const w = new PopoverWindowController(this.WindowManager, popoverItems, {
        x: windowBounds.x + 30,
        y: windowY
      });

      w.window.on("ready-to-show", () => {
        w.window.show();
      });
      return undefined;
    }
    return new Error("Could not find window with the name", windowName);
  }

  /**
   * Hides a specific window from the window's name
   *
   * @param {string} windowName name of the window to hide
   * @return {undefined}
   * @memberof WindowChannel
   */
  hideWindow(windowName) {
    if (this.WindowManager.windows[windowName]) {
      this.WindowManager.windows[windowName].hide();
      return undefined;
    }
    return new Error("Could not find window with the name", windowName);
  }

  /**
   * Is a specific window visible or hidden
   *
   * @param {string} windowName the name of the window to check if visible
   * @return {{visible: boolean}} object with visible property, either true (for visible) or false (for hidden)
   * @memberof WindowChannel
   */
  isWindowVisible(windowName) {
    if (this.WindowManager.windows[windowName]) {
      return { visible: this.WindowManager.windows[windowName].isVisible() };
    }
    return { visible: false };
  }
}

module.exports = WindowChannel;
