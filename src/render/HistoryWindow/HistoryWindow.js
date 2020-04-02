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
    webFrame.setLayoutZoomLevelLimits(0, 0);
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
    ipcRenderer.invoke("WINDOW", {
      type: "SET_BOUNDS",
      windowName: "history",
      args: {
        height: 110 + Object.keys(palettes).length * 110,
        y:
          primaryScreenSize.height -
          230 -
          (Object.keys(palettes).length - 1) * 110,
        animate: true
      }
    });

    // Generate Palette objects for stored palettes
    Object.keys(palettes).forEach(paletteId => {
      const p = new Palette(palettes[paletteId]);
      if (paletteId == "HISTORY") {
        ipcRenderer.on("color-history-update", (evt, newColor) => {
          p.appendNewColorItem(
            document.getElementById("history-list"),
            newColor
          );
        });
      }
      const pEl = p.createElement();
      p.appendNewPalette(pEl);
    });
  }

  /**
   * Configures click event listeners for magnification and close buttons
   */
  configureWindowControls() {
    document.querySelector(".picker-button").addEventListener("click", () => {
      ipcRenderer.invoke("WINDOW", { type: "SHOW", windowName: "picker" });
    });

    ipcRenderer.on("popover-hidden", () => {
      document.getElementById("select").classList.remove("active");
    });

    ipcRenderer.on("color-type-change", (e, arg) => {
      document.querySelector("#select .name").innerHTML = arg.name;
      document.querySelector("#select .icon").className = "icon " + arg.icon;
    });

    document.getElementById("select").addEventListener("click", async () => {
      const dropdownState = await ipcRenderer.invoke("WINDOW", {
        type: "IS_VISIBLE",
        windowName: "popover"
      });
      if (!dropdownState.visible) {
        ipcRenderer.invoke("WINDOW", { type: "SHOW", windowName: "popover" });
        document.getElementById("select").classList.add("active");
      } else {
        ipcRenderer.invoke("WINDOW", { type: "HIDE", windowName: "popover" });
        document.getElementById("select").classList.remove("active");
      }
    });

    document.querySelector(".window-options").addEventListener("click", () => {
      ipcRenderer.invoke("WINDOW", { type: "HIDE", windowName: "history" });
    });

    document
      .getElementsByClassName("settings-cog")[0]
      .addEventListener("click", () => {
        ipcRenderer.invoke("WINDOW", { type: "SHOW", windowName: "settings" });
      });

    document.getElementsByClassName("quit")[0].addEventListener("click", () => {
      ipcRenderer.send("quit-app");
    });
  }
}

new HistoryWindow();
