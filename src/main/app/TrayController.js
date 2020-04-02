const { Menu, Tray, app, nativeImage } = require("electron");
const log = require("electron-log");
const path = require("path");

const DefaultSettings = require("../resources/Defaults").defaultSettings;
const KeyAssignment = require("../resources/KeyAssignment");
const SettingsWindowController = require("./../windows/SettingsWindowController");

/**
 * TrayController Class
 *
 * In charge of handling the functions of the tray icon in the taskbar
 */
class TrayController {
  /**
   * Creates an instance of TrayController.
   * @param {WindowManager} windowManager the applications window manager instance
   * @param {Store} store the application store instance
   * @memberof TrayController
   */
  constructor(windowManager, store) {
    this.tray = null;
    this._WindowManager = windowManager;
    this._Store = store;
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
  async _CreateNewTray() {
    const img = nativeImage.createFromPath(
      path.resolve(__dirname, "./../../assets/img/taskbar_icon.png")
    );
    log.log(img.isEmpty());
    this.tray = new Tray(img);

    const pickerShortcut = await KeyAssignment.format(
      this._Store.get(
        "settings.shortcutOpenMagnifierKeys",
        DefaultSettings.shortcutOpenMagnifierKeys
      )
    );

    const palletteShortcut = await KeyAssignment.format(
      this._Store.get(
        "settings.shortcutOpenHistoryKeys",
        DefaultSettings.shortcutOpenHistoryKeys
      )
    );

    const contextMenu = Menu.buildFromTemplate([
      {
        label: "Picker",
        type: "normal",
        accelerator: pickerShortcut,
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
        label: "Palettes",
        type: "normal",
        accelerator: palletteShortcut,
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
