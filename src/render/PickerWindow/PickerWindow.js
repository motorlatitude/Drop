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
    this._controlDown = false;
    this._shiftDown = false;
    this._Audio = new Audio("./../assets/audio/drop.wav");

    // ensure that web frame doesn't zoom in/out using default keyboard shortcuts e.g. ctrl+plus
    document.body.style.zoom = 1.0;
    webFrame.setZoomFactor(1);
    webFrame.setVisualZoomLevelLimits(1, 1);
  }

  /**
   * Setup IPC event listener to update color squares in view
   */
  _ConfigureIPCEvents() {
    ipcRenderer.on("color", (event, arg) => {
      const elColorSquares = document.getElementById("colorsquares");
      while (elColorSquares.lastChild) {
        elColorSquares.removeChild(elColorSquares.lastChild);
      }
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
          console.warn(err);
        });
      ipcRenderer
        .invoke("SETTING", {
          type: "GET_SETTING",
          args: {
            key: "quickPicking"
          }
        })
        .then(res => {
          let hidePicker = true;
          if (this._shiftDown) {
            if (res.response) {
              hidePicker = false;
            }
          }
          ipcRenderer
            .invoke("PICKER", {
              type: "PICKED",
              args: {
                color: this.activeColor,
                hidePickerWindow: hidePicker
              }
            })
            .catch(err => {
              console.warn(err);
            });
        })
        .catch(err => {
          console.warn(err);
        });
      if (this._controlDown) {
        // control is down, save in new palette
        ipcRenderer
          .invoke("SETTING", {
            type: "GET_SETTING",
            args: {
              key: "createNewPaletteOnPick"
            }
          })
          .then(res => {
            if (res.response) {
              ipcRenderer
                .invoke("PALETTE", {
                  type: "SAVE",
                  args: {
                    // eslint-disable-next-line security-node/detect-insecure-randomness
                    id: Math.random()
                      .toString(36)
                      .substr(2, 9),
                    name: "New Color Palette",
                    colors: [this.activeColor],
                    refresh: true
                  }
                })
                .catch(err => {
                  console.warn(err);
                });
            }
          })
          .catch(err => {
            console.warn(err);
          });
      }
    });

    ipcRenderer.on("SHORTCUTS_UPDATED", () => {
      this._ConfigureShortcuts();
    });

    // shortcuts
    this._ConfigureShortcuts();

    window.addEventListener("keydown", event => {
      if (event.key === "Control" || event.key === "ctrl" || event.ctrlKey) {
        this._controlDown = true;
      }
      if (event.key === "Shift" || event.key === "shift" || event.shiftKey) {
        this._shiftDown = true;
      }
    });

    window.addEventListener("keyup", event => {
      if (
        event.key === "Escape" ||
        event.key === "Esc" ||
        event.keyCode === 27
      ) {
        ipcRenderer
          .invoke("WINDOW", { type: "HIDE", windowName: "picker" })
          .catch(err => {
            console.warn(err);
          });
      }
      this._controlDown = false;
      this._shiftDown = false;
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
            shortcut:
              settings[shortcut + "Keys"] || DefaultSettings[shortcut + "Keys"],
            callback: null,
            enabled: settings[shortcut] || DefaultSettings[shortcut]
          };
          switch (populatedShortcutObject.key) {
            case "shortcutMoveLensRight":
              populatedShortcutObject.callback = () => {
                ipcRenderer
                  .invoke("MOUSE", {
                    type: "MOVE",
                    args: { direction: "RIGHT", shift: false }
                  })
                  .catch(err => {
                    console.warn(err);
                  });
              };
              break;
            case "shortcutMoveLensLeft":
              populatedShortcutObject.callback = () => {
                ipcRenderer
                  .invoke("MOUSE", {
                    type: "MOVE",
                    args: { direction: "LEFT", shift: false }
                  })
                  .catch(err => {
                    console.warn(err);
                  });
              };
              break;
            case "shortcutMoveLensDown":
              populatedShortcutObject.callback = () => {
                ipcRenderer
                  .invoke("MOUSE", {
                    type: "MOVE",
                    args: { direction: "DOWN", shift: false }
                  })
                  .catch(err => {
                    console.warn(err);
                  });
              };
              break;
            case "shortcutMoveLensUp":
              populatedShortcutObject.callback = () => {
                ipcRenderer
                  .invoke("MOUSE", {
                    type: "MOVE",
                    args: { direction: "UP", shift: false }
                  })
                  .catch(err => {
                    console.warn(err);
                  });
              };
              break;
            case "shortcutMoveLensRight10px":
              populatedShortcutObject.callback = () => {
                ipcRenderer
                  .invoke("MOUSE", {
                    type: "MOVE",
                    args: { direction: "RIGHT", shift: true }
                  })
                  .catch(err => {
                    console.warn(err);
                  });
              };
              break;
            case "shortcutMoveLensLeft10px":
              populatedShortcutObject.callback = () => {
                ipcRenderer
                  .invoke("MOUSE", {
                    type: "MOVE",
                    args: { direction: "LEFT", shift: true }
                  })
                  .catch(err => {
                    console.warn(err);
                  });
              };
              break;
            case "shortcutMoveLensDown10px":
              populatedShortcutObject.callback = () => {
                ipcRenderer
                  .invoke("MOUSE", {
                    type: "MOVE",
                    args: { direction: "DOWN", shift: true }
                  })
                  .catch(err => {
                    console.warn(err);
                  });
              };
              break;
            case "shortcutMoveLensUp10px":
              populatedShortcutObject.callback = () => {
                ipcRenderer
                  .invoke("MOUSE", {
                    type: "MOVE",
                    args: { direction: "UP", shift: true }
                  })
                  .catch(err => {
                    console.warn(err);
                  });
              };
              break;
            case "shortcutIncreaseSize":
              populatedShortcutObject.callback = () => {
                ipcRenderer
                  .invoke("PICKER", {
                    type: "MODIFY_SIZE",
                    args: { zoomType: "increase" }
                  })
                  .catch(err => {
                    console.warn(err);
                  });
                window.scrollTo(0, 0);
              };
              break;
            case "shortcutDecreaseSize":
              populatedShortcutObject.callback = () => {
                ipcRenderer
                  .invoke("PICKER", {
                    type: "MODIFY_SIZE",
                    args: { zoomType: "decrease" }
                  })
                  .catch(err => {
                    console.warn(err);
                  });
                window.scrollTo(0, 0);
              };
              break;
            case "shortcutFormatNext":
              populatedShortcutObject.callback = () => {
                ipcRenderer
                  .invoke("FORMAT", {
                    type: "NEXT",
                    args: {}
                  })
                  .catch(err => {
                    console.warn(err);
                  });
              };
              break;
            case "shortcutFormatPrevious":
              populatedShortcutObject.callback = () => {
                ipcRenderer
                  .invoke("FORMAT", {
                    type: "BACK",
                    args: {}
                  })
                  .catch(err => {
                    console.warn(err);
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
      })
      .catch(err => {
        console.warn(err);
      });
  }
}

new PickerWindow();
