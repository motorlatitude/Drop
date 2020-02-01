const electron = require('electron');
const { ipcRenderer } = electron;

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
  }

}

const sw = new SettingsWindow();
