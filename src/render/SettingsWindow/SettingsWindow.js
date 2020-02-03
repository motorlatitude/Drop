const electron = require('electron');
const { ipcRenderer } = electron;

const packageJSON = require('../../../package.json');

/**
 * SettingsWindow Class
 *
 * Handles settings window render process
 */
class SettingsWindow {

  constructor() {
    this._ConfigureEventListeners();
  }

  _ConfigureEventListeners() {
    document.getElementById("close-window").addEventListener("click", (e) => {
      ipcRenderer.invoke("WINDOW", {type:"HIDE", windowName: "settings"});
    });

    [ ...document.getElementsByClassName("navbar-item")].forEach((el, index) => {
      el.addEventListener("click", (e) => {
        console.log("CLicked Settings View");
        const viewName = el.getAttribute("data-linked-view");
        const settingsFrame = document.querySelector(".settings-frame[data-view='"+viewName+"']");
        if (settingsFrame) {
          document.querySelector(".navbar-item.active").classList.remove("active");
          el.classList.add("active");
          document.querySelector(".settings-frame.visible").classList.remove("visible");
          settingsFrame.classList.add("visible");

          if (viewName == "about") {
            const buildHash = Buffer.from("Drop"+packageJSON.version+";NodeJS"+process.version+";Chromium:"+process.versions.chrome+";Electron:"+process.versions.electron+";").toString("base64");
            document.getElementById("drop-version").innerHTML = packageJSON.version+"<br/><span>"+buildHash+"</span>";
          }

        } else {
          console.warn("Couldn't find that settings frame, doing nothing");
        }
      });
    });

  }

}

const sw = new SettingsWindow();
