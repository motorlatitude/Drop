const { ipcRenderer, webFrame } = require("electron");
const Palette = require("./Palette");

/**
 * HistoryWindow Class
 *
 * Handles render process history window
 * @class HistoryWindow
 */
class HistoryWindow {
  /**
   * Creates an instance of HistoryWindow.
   * @memberof HistoryWindow
   */
  constructor() {
    this.configureWindowControls();
    this.fetchPalettes();
    // ensure that web frame doesn't zoom in/out using default keyboard shortcuts e.g. ctrl+plus
    document.body.style.zoom = 1.0;
    webFrame.setZoomFactor(1);
    webFrame.setVisualZoomLevelLimits(1, 1);
  }

  /**
   * Fetch palettes from storage from main process through IPC
   */
  async fetchPalettes() {
    const palettes = await ipcRenderer.invoke("PALETTE", { type: "GET_ALL" });
    // Configure Window For Correct Dimensions
    // TODO: could become a problem when a large number of palettes are created,
    // will have to include scrolling at a certain point
    const primaryScreenSize = await ipcRenderer.invoke(
      "get-primary-screen-size"
    );
    ipcRenderer
      .invoke("WINDOW", {
        type: "GET_BOUNDS",
        windowName: "history"
      })
      .then(historyWindowBounds => {
        const newHeight = 110 + Object.keys(palettes).length * 110;
        if (historyWindowBounds.y + newHeight > primaryScreenSize.height) {
          ipcRenderer
            .invoke("WINDOW", {
              type: "SET_BOUNDS",
              windowName: "history",
              args: {
                height: newHeight,
                y:
                  primaryScreenSize.height -
                  230 -
                  (Object.keys(palettes).length - 1) * 110,
                animate: true
              }
            })
            .catch(err => {
              console.warn(err);
            });
        } else {
          ipcRenderer
            .invoke("WINDOW", {
              type: "SET_BOUNDS",
              windowName: "history",
              args: {
                height: newHeight,
                animate: true
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

    // Generate Palette objects for stored history palettes
    Object.keys(palettes).forEach(paletteId => {
      if (paletteId == "HISTORY") {
        const p = new Palette(palettes[paletteId]);
        ipcRenderer.on("color-history-update", (evt, newColor) => {
          p.appendNewColorItem(
            document.getElementById("history-list"),
            newColor
          );
        });
        const pEl = p.createElement();
        p.appendNewPalette(pEl);
      }
    });

    // Generate Palette objects for stored palettes
    Object.keys(palettes).forEach(paletteId => {
      if (paletteId != "HISTORY") {
        const p = new Palette(palettes[paletteId]);
        const pEl = p.createElement();
        p.appendNewPalette(pEl);
      }
    });
  }

  /**
   * Configures click event listeners for magnification and close buttons
   */
  configureWindowControls() {
    document.querySelector(".picker-button").addEventListener("click", () => {
      ipcRenderer
        .invoke("WINDOW", { type: "SHOW", windowName: "picker" })
        .catch(err => {
          console.warn(err);
        });
    });

    ipcRenderer.on("popover-hidden", () => {
      document.getElementById("select").classList.remove("active");
    });

    ipcRenderer.on("refresh-palettes", (e, args) => {
      location.reload();
    });

    ipcRenderer.on("color-type-change", (e, arg) => {
      document.querySelector("#select .name").innerHTML = arg.name;
      document.querySelector("#select .icon").className = "icon " + arg.icon;
    });

    document.getElementsByTagName("body")[0].addEventListener("click", () => {
      if (document.getElementById("menu").classList.contains("visible")) {
        document.getElementById("menu").classList.remove("visible");
      }
    });

    document.getElementById("select").addEventListener("click", async () => {
      const dropdownState = await ipcRenderer.invoke("WINDOW", {
        type: "IS_VISIBLE",
        windowName: "popover"
      });
      if (!dropdownState.visible) {
        ipcRenderer
          .invoke("WINDOW", { type: "SHOW", windowName: "popover" })
          .catch(err => {
            console.warn(err);
          });
        document.getElementById("select").classList.add("active");
      } else {
        ipcRenderer
          .invoke("WINDOW", { type: "HIDE", windowName: "popover" })
          .catch(err => {
            console.warn(err);
          });
        document.getElementById("select").classList.remove("active");
      }
    });

    document.querySelector(".window-options").addEventListener("click", () => {
      ipcRenderer
        .invoke("WINDOW", { type: "HIDE", windowName: "history" })
        .catch(err => {
          console.warn(err);
        });
    });

    document
      .getElementsByClassName("settings-cog")[0]
      .addEventListener("click", () => {
        ipcRenderer
          .invoke("WINDOW", { type: "SHOW", windowName: "settings" })
          .catch(err => {
            console.warn(err);
          });
      });

    document.getElementsByClassName("quit")[0].addEventListener("click", () => {
      ipcRenderer.send("quit-app");
    });
  }
}

new HistoryWindow();
