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
          ipcRenderer.send("move-right", "shift");
        } else {
          ipcRenderer.send("move-right");
        }
      }
      if (event.keyCode === 37) {
        //left
        if (event.shiftKey) {
          ipcRenderer.send("move-left", "shift");
        } else {
          ipcRenderer.send("move-left");
        }
      }
      if (event.keyCode === 38) {
        //up
        if (event.shiftKey) {
          ipcRenderer.send("move-up", "shift");
        } else {
          ipcRenderer.send("move-up");
        }
      }
      if (event.keyCode === 40) {
        //down
        if (event.shiftKey) {
          ipcRenderer.send("move-down", "shift");
        } else {
          ipcRenderer.send("move-down");
        }
      }
      if (["-", "Minus"].includes(event.key)) {
        //minus decreases loop size
        console.log("Decrease Loop Size");
        ipcRenderer.send("loop-size", "picker-decrease");
        document.body.style.zoom = 1.0;
        event.preventDefault();
      }
      if (event.key == "+") {
        //plus Increase loop size
        ipcRenderer.send("loop-size", "picker-increase");
        document.body.style.zoom = 1.0;
        event.preventDefault();
      }
    });
  }
}

const pw = new PickerWindow();
