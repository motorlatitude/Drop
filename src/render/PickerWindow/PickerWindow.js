const { ipcRenderer, webFrame } = require("electron");
const namer = require("color-namer");
const Mousetrap = require("mousetrap");

const KeyAssignment = require("../../main/resources/KeyAssignment");
const DefaultSettings = require("../../main/resources/Defaults")
  .defaultSettings;
/**
 * PickerWindow Class
 *
 * Handles Render Picker Window process
 * @class PickerWindow
 */
class PickerWindow {
  /**
   * Creates an instance of PickerWindow.
   * @memberof PickerWindow
   */
  constructor() {
    this.activeColor = null;
    this._ConfigureWindowEventListeners();
    this._ConfigureIPCEvents();
    this._Audio = new Audio("./../assets/audio/drop.wav");

    // ensure that web frame doesn't zoom in/out using default keyboard shortcuts e.g. ctrl+plus
    document.body.style.zoom = 1.0;
    webFrame.setZoomFactor(1);
    webFrame.setVisualZoomLevelLimits(1, 1);
    webFrame.setLayoutZoomLevelLimits(0, 0);
  }

  /**
   * Setup IPC event listener to update color squares in view
   */
  _ConfigureIPCEvents() {
    ipcRenderer.on("color", (event, arg) => {
      arg = JSON.parse(arg);
      const elColorSquares = document.getElementById("colorsquares");
      elColorSquares.innerHTML = "";
      const middle = Math.floor(Object.keys(arg).length / 2);
      Object.keys(arg).forEach((key, index) => {
        const colorRow = arg[key];
        const tr = document.createElement("tr");
        let o = 0;
        for (const k in colorRow) {
          if (Object.prototype.hasOwnProperty.call(colorRow, k)) {
            const td = document.createElement("td");
            td.setAttribute("style", "background: #" + colorRow[k].color + ";");
            if (middle == index && middle == o) {
              td.classList.add("center");
              this.activeColor = colorRow[k].color;
              const hexColor = "#" + this.activeColor.toUpperCase();
              document.getElementById("a").innerHTML =
                namer(hexColor, { pick: ["pantone"] }).pantone[0].name +
                ": " +
                hexColor;
            }
            tr.appendChild(td);
            o++;
          }
        }
        elColorSquares.appendChild(tr);
      });
    });
  }

  /**
   * Setup Window EventListeners
   */
  _ConfigureWindowEventListeners() {
    window.addEventListener("click", () => {
      document.getElementById("a").innerHTML = "Copied";
      // Check if we should play sounds according to the settings
      ipcRenderer
        .invoke("SETTING", {
          type: "GET_SETTING",
          args: {
            key: "playSounds"
          }
        })
        .then(res => {
          // if response is true then play drop audio
          if (res.response) {
            this._Audio.play();
          }
        })
        .catch(err => {
          console.error(err);
        });
      ipcRenderer.invoke("PICKER", {
        type: "PICKED",
        args: { color: this.activeColor }
      });
    });

    ipcRenderer.on("SHORTCUTS_UPDATED", () => {
      this._ConfigureShortcuts();
    });

    // shortcuts
    this._ConfigureShortcuts();

    window.addEventListener("keyup", event => {
      if (
        event.key === "Escape" ||
        event.key === "Esc" ||
        event.keyCode === 27
      ) {
        ipcRenderer.invoke("WINDOW", { type: "HIDE", windowName: "picker" });
      }
    });
  }

  /**
   * Configure shortcuts for Picker
   */
  _ConfigureShortcuts() {
    Mousetrap.reset(); // clear all previous shortcuts if this is a shortcut update
    const allShortcuts = {
      shortcutMoveLensRight: {},
      shortcutMoveLensLeft: {},
      shortcutMoveLensDown: {},
      shortcutMoveLensUp: {},
      shortcutMoveLensRight10px: {},
      shortcutMoveLensLeft10px: {},
      shortcutMoveLensDown10px: {},
      shortcutMoveLensUp10px: {},
      shortcutIncreaseSize: {},
      shortcutDecreaseSize: {},
      shortcutFormatNext: {},
      shortcutFormatPrevious: {}
    };
    ipcRenderer
      .invoke("SETTING", {
        type: "GET_ALL_SETTINGS",
        args: {}
      })
      .then(settings => {
        Object.keys(allShortcuts).forEach((shortcut, index) => {
          const populatedShortcutObject = {
            key: shortcut,
            shortcut: settings[shortcut + "Keys"]
              ? settings[shortcut + "Keys"]
              : DefaultSettings[shortcut + "Keys"],
            callback: null,
            enabled: settings[shortcut]
              ? settings[shortcut]
              : DefaultSettings[shortcut]
          };
          switch (populatedShortcutObject.key) {
            case "shortcutMoveLensRight":
              populatedShortcutObject.callback = () => {
                ipcRenderer.invoke("MOUSE", {
                  type: "MOVE",
                  args: { direction: "RIGHT", shift: false }
                });
              };
              break;
            case "shortcutMoveLensLeft":
              populatedShortcutObject.callback = () => {
                ipcRenderer.invoke("MOUSE", {
                  type: "MOVE",
                  args: { direction: "LEFT", shift: false }
                });
              };
              break;
            case "shortcutMoveLensDown":
              populatedShortcutObject.callback = () => {
                ipcRenderer.invoke("MOUSE", {
                  type: "MOVE",
                  args: { direction: "DOWN", shift: false }
                });
              };
              break;
            case "shortcutMoveLensUp":
              populatedShortcutObject.callback = () => {
                ipcRenderer.invoke("MOUSE", {
                  type: "MOVE",
                  args: { direction: "UP", shift: false }
                });
              };
              break;
            case "shortcutMoveLensRight10px":
              populatedShortcutObject.callback = () => {
                ipcRenderer.invoke("MOUSE", {
                  type: "MOVE",
                  args: { direction: "RIGHT", shift: true }
                });
              };
              break;
            case "shortcutMoveLensLeft10px":
              populatedShortcutObject.callback = () => {
                ipcRenderer.invoke("MOUSE", {
                  type: "MOVE",
                  args: { direction: "LEFT", shift: true }
                });
              };
              break;
            case "shortcutMoveLensDown10px":
              populatedShortcutObject.callback = () => {
                ipcRenderer.invoke("MOUSE", {
                  type: "MOVE",
                  args: { direction: "DOWN", shift: true }
                });
              };
              break;
            case "shortcutMoveLensUp10px":
              populatedShortcutObject.callback = () => {
                ipcRenderer.invoke("MOUSE", {
                  type: "MOVE",
                  args: { direction: "UP", shift: true }
                });
              };
              break;
            case "shortcutIncreaseSize":
              populatedShortcutObject.callback = () => {
                ipcRenderer.invoke("PICKER", {
                  type: "MODIFY_SIZE",
                  args: { zoomType: "increase" }
                });
                window.scrollTo(0, 0);
              };
              break;
            case "shortcutDecreaseSize":
              populatedShortcutObject.callback = () => {
                ipcRenderer.invoke("PICKER", {
                  type: "MODIFY_SIZE",
                  args: { zoomType: "decrease" }
                });
                window.scrollTo(0, 0);
              };
              break;
            case "shortcutFormatNext":
              populatedShortcutObject.callback = () => {
                ipcRenderer.invoke("FORMAT", {
                  type: "NEXT",
                  args: {}
                });
              };
              break;
            case "shortcutFormatPrevious":
              populatedShortcutObject.callback = () => {
                ipcRenderer.invoke("FORMAT", {
                  type: "BACK",
                  args: {}
                });
              };
              break;
          }
          allShortcuts[shortcut] = populatedShortcutObject;
        });

        Object.keys(allShortcuts).forEach(shortcutKey => {
          const shortcut = allShortcuts[shortcutKey];
          if (shortcut.enabled) {
            Mousetrap.bind(
              KeyAssignment.format(shortcut.shortcut).toLowerCase(),
              shortcut.callback
            );
          }
        });
      });
  }
}

new PickerWindow();
