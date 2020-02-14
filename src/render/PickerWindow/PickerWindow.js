const { ipcRenderer } = require("electron");
const namer = require("color-namer");

class PickerWindow {
  constructor() {
    this.activeColor = null;
    this._ConfigureWindowEventListeners();
    this._ConfigureIPCEvents();
    this._Audio = new Audio("./../assets/audio/drop.wav");
  }

  /**
   * Setup IPC event listener to update color squares in view
   */
  _ConfigureIPCEvents() {
    ipcRenderer.on("color", (event, arg) => {
      arg = JSON.parse(arg);
      let elColorSquares = document.getElementById("colorsquares");
      elColorSquares.innerHTML = "";
      let middle = Math.floor(Object.keys(arg).length / 2);
      Object.keys(arg).forEach((key, index) => {
        let color_row = arg[key];
        let tr = document.createElement("tr");
        let o = 0;
        for (let k in color_row) {
          let td = document.createElement("td");
          td.setAttribute("style", "background: #" + color_row[k].color + ";");
          if (middle == index && middle == o) {
            td.classList.add("center");
            this.activeColor = color_row[k].color;
            const hexColor = "#" + this.activeColor.toUpperCase();
            document.getElementById("a").innerHTML =
              namer(hexColor, { pick: ["pantone"] }).pantone[0].name + ": " + hexColor;
          }
          tr.appendChild(td);
          o++;
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
      this._Audio.play();
      ipcRenderer.send("clicked", this.activeColor);
    });

    window.addEventListener("keyup", event => {
      console.log(event.key);
      if (event.key === "Escape" || event.key === "Esc" || event.keyCode === 27) {
        ipcRenderer.invoke("WINDOW", { type: "HIDE", windowName: "picker" });
      }
      if (event.keyCode === 39) {
        //right
        if (event.shiftKey) {
          ipcRenderer.invoke("MOUSE", { type: "MOVE", args: { direction: "RIGHT", shift: true } });
        } else {
          ipcRenderer.invoke("MOUSE", { type: "MOVE", args: { direction: "RIGHT", shift: false } });
        }
      }
      if (event.keyCode === 37) {
        //left
        if (event.shiftKey) {
          ipcRenderer.invoke("MOUSE", { type: "MOVE", args: { direction: "LEFT", shift: true } });
        } else {
          ipcRenderer.invoke("MOUSE", { type: "MOVE", args: { direction: "LEFT", shift: false } });
        }
      }
      if (event.keyCode === 38) {
        //up
        if (event.shiftKey) {
          ipcRenderer.invoke("MOUSE", { type: "MOVE", args: { direction: "UP", shift: true } });
        } else {
          ipcRenderer.invoke("MOUSE", { type: "MOVE", args: { direction: "UP", shift: false } });
        }
      }
      if (event.keyCode === 40) {
        //down
        if (event.shiftKey) {
          ipcRenderer.invoke("MOUSE", { type: "MOVE", args: { direction: "DOWN", shift: true } });
        } else {
          ipcRenderer.invoke("MOUSE", { type: "MOVE", args: { direction: "DOWN", shift: false } });
        }
      }
      if (["-", "Minus"].includes(event.key)) {
        //minus decreases loop size
        ipcRenderer.invoke("PICKER", { type: "MODIFY_SIZE", args: { zoomType: "decrease" } });
        document.body.style.zoom = 1.0;
        event.preventDefault();
      }
      if (event.key == "+") {
        //plus Increase loop size
        ipcRenderer.invoke("PICKER", { type: "MODIFY_SIZE", args: { zoomType: "increase" } });
        document.body.style.zoom = 1.0;
        event.preventDefault();
      }
    });
  }
}

const pw = new PickerWindow();
