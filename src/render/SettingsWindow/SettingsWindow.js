const electron = require("electron");
const { ipcRenderer } = electron;
const moment = require("moment");

const packageJSON = require("../../../package.json");

/**
 * SettingsWindow Class
 *
 * Handles settings window render process
 */
class SettingsWindow {
  constructor() {
    this._ConfigureEventListeners();
    this._setSettings();
  }

  _setSettings() {
    ipcRenderer.invoke("SETTING", {
      type: "GET_ALL_SETTINGS"
    });

    ipcRenderer
      .invoke("SETTING", {
        type: "GET_SETTING",
        args: { key: "lastUpdateCheck" }
      })
      .then(setting => {
        if (setting.response) {
          document.getElementById("last-update-check").innerHTML = "Last checked " + moment(setting.response).fromNow();
        } else {
          document.getElementById("last-update-check").innerHTML = "";
        }
      });
    ipcRenderer
      .invoke("SETTING", {
        type: "GET_SETTING",
        args: { key: "autoCheckDownloadUpdates" }
      })
      .then(setting => {
        if (setting.response === true) {
          document.getElementById("drop-autodownloadupdate").setAttribute("checked", "true");
        } else {
          document.getElementById("drop-autodownloadupdate").removeAttribute("checked");
        }
      });

    ipcRenderer
      .invoke("SETTING", {
        type: "GET_SETTING",
        args: { key: "autoInstallUpdates" }
      })
      .then(setting => {
        if (setting.response === true) {
          document.getElementById("drop-autoupdate").setAttribute("checked", "true");
        } else {
          document.getElementById("drop-autoupdate").removeAttribute("checked");
        }
      });
  }

  _ConfigureEventListeners() {
    document.getElementById("close-window").addEventListener("click", e => {
      ipcRenderer.invoke("WINDOW", { type: "HIDE", windowName: "settings" });
    });

    [...document.getElementsByClassName("navbar-item")].forEach((el, index) => {
      el.addEventListener("click", e => {
        console.log("CLicked Settings View");
        const viewName = el.getAttribute("data-linked-view");
        const settingsFrame = document.querySelector(".settings-frame[data-view='" + viewName + "']");
        if (settingsFrame) {
          document.querySelector(".navbar-item.active").classList.remove("active");
          el.classList.add("active");
          document.querySelector(".settings-frame.visible").classList.remove("visible");
          settingsFrame.classList.add("visible");

          if (viewName == "about") {
            const buildHash = Buffer.from(
              packageJSON.version +
                ";" +
                process.version +
                ";" +
                process.versions.chrome +
                ";" +
                process.versions.electron +
                ";"
            ).toString("base64");
            document.getElementById("drop-version").innerHTML =
              "Drop <div class='version'>Version " + packageJSON.version + "</div>";
          }
        } else {
          console.warn("Couldn't find that settings frame, doing nothing");
        }
      });
    });

    /* ABOUT */

    const updateButtonEl = document.getElementById("drop-btn-check-update");
    updateButtonEl.addEventListener("click", e => {
      if (!updateButtonEl.getAttribute("disabled")) {
        updateButtonEl.setAttribute("disabled", true);
        if (updateButtonEl.getAttribute("data-function") == "check") {
          ipcRenderer.invoke("SETTING", {
            type: "MODIFY_SETTING",
            args: { key: "lastUpdateCheck", value: new Date().getTime() }
          });
          document.getElementById("last-update-check").innerHTML =
            "Last checked " + moment(new Date().getTime()).fromNow();
          document.getElementById("update-status").innerHTML = "Checking For Updates";
          ipcRenderer
            .invoke("SETTING", { type: "CHECK_UPDATE" })
            .then(data => {
              console.log(data);
              if (data.error !== null) {
                console.error(data.error);
                document.getElementById("update-status").innerHTML = "Error Occurred Finding Updates";
                updateButtonEl.removeAttribute("disabled");
              }
            })
            .catch(err => {
              console.error(err);
              document.getElementById("update-status").innerHTML = "Error Occurred Finding Updates";
              updateButtonEl.removeAttribute("disabled");
            });
        } else if (updateButtonEl.getAttribute("data-function") == "download") {
          ipcRenderer.invoke("SETTING", { type: "DOWNLOAD_UPDATE" }).catch(err => {
            console.error(err);
            document.getElementById("update-status").innerHTML = "Error Occurred Downloading Updates";
            updateButtonEl.removeAttribute("disabled");
          });
        } else if (updateButtonEl.getAttribute("data-function") == "install") {
          ipcRenderer.invoke("SETTING", { type: "INSTALL_UPDATE" }).catch(err => {
            console.error(err);
            document.getElementById("update-status").innerHTML = "Error Occurred Installing Updates";
            updateButtonEl.removeAttribute("disabled");
          });
        }
      }
    });

    // Updater is downloading an update
    ipcRenderer.on("UPDATER-DOWNLOADING", () => {
      document.getElementById("update-status").innerHTML = "Downloading...";
    });

    // Updater found a newer version
    ipcRenderer.on("UPDATER-UPDATE-AVAILABLE", () => {
      document.getElementById("update-status").innerHTML = "Update Available";
      updateButtonEl.value = "Download Update";
      updateButtonEl.setAttribute("data-function", "download");
      updateButtonEl.removeAttribute("disabled");
    });

    // Updater didn't find a newer version
    ipcRenderer.on("UPDATER-UPDATE-UNAVAILABLE", () => {
      document.getElementById("update-status").innerHTML = "Up To Date";
      updateButtonEl.removeAttribute("disabled");
    });

    // Updater found a newer version
    ipcRenderer.on("UPDATER-UPDATE-DOWNLOADED", () => {
      document.getElementById("update-status").innerHTML = "Update Ready";
      updateButtonEl.value = "Install & Restart";
      updateButtonEl.setAttribute("data-function", "install");
      updateButtonEl.removeAttribute("disabled");
    });

    const autoDownloadUpdateCheckboxEl = document.getElementById("drop-autodownloadupdate");
    autoDownloadUpdateCheckboxEl.addEventListener("change", e => {
      ipcRenderer.invoke("SETTING", {
        type: "MODIFY_SETTING",
        args: {
          key: "autoCheckDownloadUpdates",
          value: autoDownloadUpdateCheckboxEl.checked
        }
      });
    });

    const autoInstallUpdateCheckboxEl = document.getElementById("drop-autoupdate");
    autoInstallUpdateCheckboxEl.addEventListener("change", e => {
      ipcRenderer.invoke("SETTING", {
        type: "MODIFY_SETTING",
        args: {
          key: "autoInstallUpdates",
          value: autoInstallUpdateCheckboxEl.checked
        }
      });
    });
  }
}

const sw = new SettingsWindow();
