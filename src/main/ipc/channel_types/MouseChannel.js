const robot = require("robotjs");
const log = require("electron-log");

const Channel = require("./Channel");

/**
 * IPC Channel for mouse movements
 *
 * @export MouseChannel
 * @class MouseChannel
 * @extends {Channel}
 */
class MouseChannel extends Channel {
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
      case "MOVE":
        return this.moveMouse(ipcEventDataObject.args);
      default:
        log.warn("UNKNOWN IPC TYPE FOR MOUSE CHANNEL");
        break;
    }
  }

  /**
   * Moves mouse cursor
   * @param {{direction: ('RIGHT' | 'LEFT' | 'UP' | 'DOWN'), shift: boolean}} args arguments
   * @return {undefined} undefined
   * @memberof MouseChannel
   */
  moveMouse(args) {
    const currentMousePosition = robot.getMousePos();
    switch (args.direction) {
      case "RIGHT":
        if (args.shift) {
          robot.moveMouse(currentMousePosition.x + 10, currentMousePosition.y);
          return undefined;
        }
        robot.moveMouse(currentMousePosition.x + 1, currentMousePosition.y);
        return undefined;
      case "LEFT":
        if (args.shift) {
          robot.moveMouse(currentMousePosition.x - 10, currentMousePosition.y);
          return undefined;
        }
        robot.moveMouse(currentMousePosition.x - 1, currentMousePosition.y);
        return undefined;
      case "UP":
        if (args.shift) {
          robot.moveMouse(currentMousePosition.x, currentMousePosition.y - 10);
          return undefined;
        }
        robot.moveMouse(currentMousePosition.x, currentMousePosition.y - 1);
        return undefined;
      case "DOWN":
        if (args.shift) {
          robot.moveMouse(currentMousePosition.x, currentMousePosition.y + 10);
          return undefined;
        }
        robot.moveMouse(currentMousePosition.x, currentMousePosition.y + 1);
        return undefined;
      default:
        log.error(
          new Error("Unknown direction to move the mouse in", args.direction)
        );
        return undefined;
    }
  }
}

module.exports = MouseChannel;
