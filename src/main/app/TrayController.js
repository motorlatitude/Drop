const { Menu, Tray, app } = require("electron");
const log = require("electron-log");

const SettingsWindowController = require("./../windows/SettingsWindowController");

/**
 * TrayController Class
 *
 * In charge of handling the functions of the tray icon in the taskbar
 */
class TrayController {
  /**
   * Creates an instance of TrayController.
   * @param {WindowManager} windowManager
   * @memberof TrayController
   */
  constructor(windowManager) {
    this.tray = null;
    this._WindowManager = windowManager;
    this._CreateNewTray();
  }

  /**
   * Set the tray icon image
   *
   * @param {NativeImage} img an electron native image
   * @memberof TrayController
   */
  setTrayImage(img) {
    this.tray.setImage(img);
  }

  /**
   * Create a new tray application
   *
   * @memberof TrayController
   */
  _CreateNewTray() {
    this.tray = new Tray(__dirname + "./../../assets/img/taskbar_icon.png");

    const contextMenu = Menu.buildFromTemplate([
      {
        label: "Picker",
        type: "normal",
        click: () => {
          if (this._WindowManager.windows.picker) {
            if (this._WindowManager.windows.picker.isVisible()) {
              this._WindowManager.windows.picker.hide();
            } else {
              this._WindowManager.windows.picker.show();
            }
          }
        }
      },
      {
        label: "History",
        type: "normal",
        click: () => {
          if (this._WindowManager.windows.history) {
            if (this._WindowManager.windows.history.isVisible()) {
              this._WindowManager.windows.history.hide();
            } else {
              this._WindowManager.windows.history.show();
            }
          }
        }
      },
      { type: "separator" },
      {
        label: "Settings",
        type: "normal",
        click: () => {
          if (this._WindowManager.windows.settings) {
            if (this._WindowManager.windows.settings.isVisible()) {
              this._WindowManager.windows.settings.hide();
            } else {
              this._WindowManager.windows.settings.show();
            }
          } else {
            const w = new SettingsWindowController(this._WindowManager);
            w.window.on("ready-to-show", () => {
              w.window.show();
            });
          }
        }
      },
      { type: "separator" },
      {
        label: "Quit",
        type: "normal",
        click: () => {
          log.info("Quitting");
          app.quit();
        }
      }
    ]);
    this.tray.setToolTip("Drop");
    this.tray.setContextMenu(contextMenu);

    this.tray.on("click", () => {
      if (this._WindowManager.windows.history) {
        if (this._WindowManager.windows.history.isVisible()) {
          this._WindowManager.windows.history.hide();
        } else {
          this._WindowManager.windows.history.show();
        }
      }
    });
  }
}

module.exports = TrayController;
