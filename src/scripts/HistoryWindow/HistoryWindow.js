const { ipcRenderer, remote } = require('electron');
const Palette = require('./Palette');
const PopoverWindowController = require('./../PopoverWindow/PopoverWindowController');

class HistoryWindow {

  constructor() {
    this._Palettes = [];
    this.configureWindowControls();
    this.fetchPalettes();
  }

  /**
   * Fetch palettes from storage from main process through IPC communication
   */
  fetchPalettes() {
    ipcRenderer.on("get-palettes-response", (event, palettes) => {
      console.log("Palettes: ",palettes);

      // Configure Window For Correct Dimensions
      // TODO: could become a problem when a large number of palettes are created,
      // will have to include scrolling at a certain point
      remote.getCurrentWindow().setBounds({
          height: 110 + Object.keys(palettes).length*110,
          y: (remote.screen.getPrimaryDisplay().workAreaSize.height - 230) - (Object.keys(palettes).length - 1)*110
      }, true);
      Object.keys(palettes).forEach((paletteId) => {
        const p = new Palette(palettes[paletteId]);
        this._Palettes.push(p);
        if (paletteId == "HISTORY") {
          ipcRenderer.on("color-history-update", (evt, newColor) => {
            p.AppendNewColorItem(document.getElementById("history-list"), newColor);
          });
        }
        const pEl = p.CreateElement();
        p.AppendNewPalette(pEl);
      });
    });
    ipcRenderer.send("get-palettes");
  }

  /**
   * Configures click event listeners for magnification and close buttons
   */
  configureWindowControls() {
    document.querySelector(".picker-button").addEventListener("click", () => {
      ipcRenderer.send("show-loop");
    });

    const selectWindowController = new PopoverWindowController(remote.getCurrentWindow(), [{
      clickHandler: (colorType) => {
        let ct = {
            type: colorType,
            name: "CSS Hex",
            icon: "css"
        };
        ipcRenderer.send("color-type-change", ct);

        document.querySelector("#select .name").innerHTML = "CSS Hex";
        document.querySelector("#select .icon").className = "icon css";
      },
      title: "CSS Hex",
      sub_title: "#rrggbb",
      icon: "css",
      isSeparator: false,
      value: "css_hex"
    }, {
      isSeparator: true
    }, {
      clickHandler: (colorType) => {
        let ct = {
            type: colorType,
            name: "CSS HSL",
            icon: "css_2"
        };
        ipcRenderer.send("color-type-change", ct);

        document.querySelector("#select .name").innerHTML = "CSS HSL";
        document.querySelector("#select .icon").className = "icon css_2";
      },
      title: "CSS HSL",
      sub_title: "hsl(hue, sat%, light%)",
      icon: "css_2",
      isSeparator: false,
      value: "css_hsl"
    }, {
      clickHandler: (colorType) => {
        let ct = {
            type: colorType,
            name: "CSS HSLA",
            icon: "css_2"
        };
        ipcRenderer.send("color-type-change", ct);

        document.querySelector("#select .name").innerHTML = "CSS HSLA";
        document.querySelector("#select .icon").className = "icon css_2";
      },
      title: "CSS HSLA",
      sub_title: "hsl(hue, sat%, light%, alpha)",
      icon: "css_2",
      isSeparator: false,
      value: "css_hsla"
    }, {
      clickHandler: (colorType) => {
        let ct = {
            type: colorType,
            name: "CSS RGB",
            icon: "css_2"
        };
        ipcRenderer.send("color-type-change", ct);

        document.querySelector("#select .name").innerHTML = "CSS RGB";
        document.querySelector("#select .icon").className = "icon css_2";
      },
      title: "CSS RGB",
      sub_title: "rgb(rrr,ggg,bbb)",
      icon: "css_2",
      isSeparator: false,
      value: "css_rgb"
    }, {
      clickHandler: (colorType) => {
        let ct = {
            type: colorType,
            name: "CSS RGBA",
            icon: "css_2"
        };
        ipcRenderer.send("color-type-change", ct);

        document.querySelector("#select .name").innerHTML = "CSS RGBA";
        document.querySelector("#select .icon").className = "icon css_2";
      },
      title: "CSS RGBA",
      sub_title: "rgba(rrr,ggg,bbb)",
      icon: "css_2",
      isSeparator: false,
      value: "css_rgba"
    }]);

    selectWindowController.WindowBox.on("hide", (e) => {
      document.getElementById("select").classList.remove("active");
    });
    selectWindowController.WindowBox.on("blur", (e) => {
      document.getElementById("select").classList.remove("active");
    });

    document.getElementById("select").addEventListener("click", (e) => {

      if(!selectWindowController.isVisible){
        let windowBounds = remote.getCurrentWindow().getBounds();

        let windowY = windowBounds.y + 50;
        let windowScreen = remote.screen.getDisplayNearestPoint({
          x: windowBounds.x,
          y: windowBounds.y
        });
        if(windowY + 260 >= windowScreen.bounds.height){
          windowY = windowY - 260 - 45;
        }

        selectWindowController.WindowBox.setBounds({
          width: 340,
          height: 260,
          x: windowBounds.x + 30,
          y: windowY
        },false);
        document.getElementById("select").classList.add("active");
        selectWindowController.WindowBox.show();
      }
      else{
        selectWindowController.WindowBox.hide();
        document.getElementById("select").classList.remove("active");
      }
    });

    document.querySelector(".window-options").addEventListener("click", () => {
      var window = remote.getCurrentWindow();
      window.hide();
    });
  }

}

const hw = new HistoryWindow();
