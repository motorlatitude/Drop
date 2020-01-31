const { ipcRenderer } = require('electron');
const Palette = require('./Palette');

class HistoryWindow {

  constructor() {
    this.configureWindowControls();
    this.fetchPalettes();
  }

  /**
   * Fetch palettes from storage from main process through IPC
   */
  async fetchPalettes() {
    const palettes = await ipcRenderer.invoke("get-palettes");
    // Configure Window For Correct Dimensions
    // TODO: could become a problem when a large number of palettes are created,
    // will have to include scrolling at a certain point
    const primaryScreenSize = await ipcRenderer.invoke("get-primary-screen-size");
    ipcRenderer.send("modify-bounds", {
      windowName: "history",
      bounds: {
        height: 110 + Object.keys(palettes).length*110,
        y: (primaryScreenSize.height - 230) - (Object.keys(palettes).length - 1)*110
      },
      animate: true
    });

    // Generate Palette objects for stored palettes
    Object.keys(palettes).forEach((paletteId) => {
      const p = new Palette(palettes[paletteId]);
      if (paletteId == "HISTORY") {
        ipcRenderer.on("color-history-update", (evt, newColor) => {
          p.AppendNewColorItem(document.getElementById("history-list"), newColor);
        });
      }
      const pEl = p.CreateElement();
      p.AppendNewPalette(pEl);
    });

  }

  /**
   * Configures click event listeners for magnification and close buttons
   */
  configureWindowControls() {
    document.querySelector(".picker-button").addEventListener("click", () => {
      ipcRenderer.send("show-loop");
    });

    document.getElementById("select").addEventListener("click", async (e) => {
      const dropdownState = await ipcRenderer.invoke("get-formats-state");
      if(!dropdownState){
        ipcRenderer.send("show-formats");
        document.getElementById("select").classList.add("active");
      }
      else{
        ipcRenderer.send("hide-window", "popover");
        document.getElementById("select").classList.remove("active");
      }
    });

    document.querySelector(".window-options").addEventListener("click", () => {
      ipcRenderer.send("hide-window", "history");
    });

    document.getElementsByClassName("settings-cog")[0].addEventListener("click", () => {
      ipcRenderer.send("show-settings");
    });

    document.getElementsByClassName("quit")[0].addEventListener("click", () => {
      ipcRenderer.send("quit-app");
    });
  }

}

const hw = new HistoryWindow();
