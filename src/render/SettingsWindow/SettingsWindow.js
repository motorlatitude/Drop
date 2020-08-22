const Sentry = require("@sentry/electron");

Sentry.init({ dsn: process.env.DSN });

const electron = require("electron");
const webFrame = electron.webFrame;
const { ipcRenderer } = electron;
const moment = require("moment");
const CodeFlask = require("codeflask");

const KeyFormatter = require("./KeyFormatter.js");
const packageJSON = require("../../../package.json");

/**
 * SettingsWindow Class
 *
 * Handles settings window render process
 */
class SettingsWindow {
  /**
   * Initiate a new settings window
   */
  constructor() {
    this._CheckboxSettingKeys = [
      "launchOnStartup",
      "autoInstallUpdates",
      "autoCheckDownloadUpdates",
      "playSounds",
      "isHistoryLimit",
      "showPickedColor",
      "shortcutOpenMagnifier",
      "shortcutOpenHistory",
      "shortcutMoveLensUp",
      "shortcutMoveLensRight",
      "shortcutMoveLensDown",
      "shortcutMoveLensLeft",
      "shortcutMoveLensUp10px",
      "shortcutMoveLensRight10px",
      "shortcutMoveLensDown10px",
      "shortcutMoveLensLeft10px",
      "shortcutIncreaseSize",
      "shortcutDecreaseSize",
      "shortcutFormatNext",
      "shortcutFormatPrevious",
      "createNewPaletteOnPick"
    ];
    this._KeyListSettingKeys = [
      "shortcutOpenHistoryKeys",
      "shortcutOpenMagnifierKeys",
      "shortcutMoveLensUpKeys",
      "shortcutMoveLensRightKeys",
      "shortcutMoveLensDownKeys",
      "shortcutMoveLensLeftKeys",
      "shortcutMoveLensUp10pxKeys",
      "shortcutMoveLensRight10pxKeys",
      "shortcutMoveLensDown10pxKeys",
      "shortcutMoveLensLeft10pxKeys",
      "shortcutIncreaseSizeKeys",
      "shortcutDecreaseSizeKeys",
      "shortcutFormatNextKeys",
      "shortcutFormatPreviousKeys"
    ];
    this._KeyFormatter = new KeyFormatter();
    this._ConfigureEventListeners();
    this._setSettings();

    // ensure that web frame doesn't zoom in/out using default keyboard shortcuts e.g. ctrl+plus
    document.body.style.zoom = 1.0;
    webFrame.setZoomFactor(1);
    webFrame.setVisualZoomLevelLimits(1, 1);
  }

  /**
   * Set the initial settings states
   *
   * @memberof SettingsWindow
   */
  _setSettings() {
    ipcRenderer
      .invoke("SETTING", {
        type: "GET_ALL_SETTINGS"
      })
      .then(settings => {
        // init some settings
        document.getElementById("lastUpdateCheck").innerHTML = "";
        document.getElementById("historyLimit").value = 30;

        // Checkboxes
        const setCheckbox = (key, value) => {
          switch (key) {
            case "isHistoryLimit":
              if (value === true) {
                document
                  .getElementById("historyLimit")
                  .removeAttribute("disabled");
              } else {
                document
                  .getElementById("historyLimit")
                  .setAttribute("disabled", "true");
              }
          }

          if (value === true) {
            document.getElementById(key).setAttribute("checked", "true");
          } else {
            document.getElementById(key).removeAttribute("checked");
          }
        };

        // key lists
        const setKeyList = (key, value) => {
          const kEl = document.querySelector(
            ".shortcut-keys[data-shortcut-for='" + key.slice(0, -4) + "'] ul"
          );
          kEl.innerHTML = ""; // make sure nothing is in the fields
          for (let i = 0; i < value.length; i++) {
            const eKey = value[i];
            const newKey = document.createElement("li");
            newKey.setAttribute("data-key", eKey);
            const keyName = this._KeyFormatter.format(eKey);
            newKey.innerHTML = keyName;
            kEl.appendChild(newKey);
          }
        };

        // loop over existing settings
        Object.keys(settings).forEach((settingKey, index) => {
          // Special Fields
          switch (settingKey) {
            case "lastUpdateCheck":
              document.getElementById(settingKey).innerHTML =
                "Last checked " + moment(settings[settingKey]).fromNow();
              break;
            case "historyLimit":
              document.getElementById("historyLimit").value =
                settings[settingKey];
              break;
            case "colorProfile":
              document.getElementById("colorProfile").value =
                settings[settingKey];
              break;
          }
          // If key is part of this._CheckboxSettingKeys array then set checkbox according to store value
          if (this._CheckboxSettingKeys.indexOf(settingKey) > -1) {
            setCheckbox(settingKey, settings[settingKey]);
          }
          // If key is part of this._KeyListSettingKeys array then set key list according to store value
          if (this._KeyListSettingKeys.indexOf(settingKey) > -1) {
            setKeyList(settingKey, settings[settingKey]);
          }
        });
      });
    ipcRenderer
      .invoke("FORMAT", { type: "GET_ALL", args: {} })
      .then(colorFormats => {
        this._HandleColorFormats(colorFormats);
      });

    ipcRenderer.on("FORMATS_UPDATED", (event, colorFormats) => {
      this._HandleColorFormats(colorFormats);
    });
  }

  /**
   * Populate formats tab in settings
   * @param {*} colorFormats list of available color formats
   */
  _HandleColorFormats(colorFormats) {
    const colorFormatListEl = document.getElementById("all-formats-list");
    colorFormatListEl.innerHTML = "";
    document.querySelector(".formats-main-frame").innerHTML = "";
    colorFormats.forEach((format, index) => {
      const newColorFormatItem = document.createElement("li");
      newColorFormatItem.setAttribute("data-sidebar-nav", format.value);
      if (index === 0) {
        newColorFormatItem.classList.add("active");
      }
      newColorFormatItem.innerHTML = format.title;
      newColorFormatItem.addEventListener("click", e => {
        const activeListItemEl = document.querySelector(
          ".formats-sidebar ul li.active"
        );
        if (activeListItemEl) {
          activeListItemEl.classList.remove("active");
        }
        newColorFormatItem.classList.add("active");
        document
          .querySelector(".formats-main-frame ul.visible")
          .classList.remove("visible");
        document
          .querySelector(
            ".formats-main-frame ul[data-format-group='" +
              newColorFormatItem.getAttribute("data-sidebar-nav") +
              "']"
          )
          .classList.add("visible");
      });
      colorFormatListEl.appendChild(newColorFormatItem);

      const newMainColorFormatItem = document.createElement("ul");
      newMainColorFormatItem.setAttribute("data-format-group", format.value);
      if (index === 0) {
        newMainColorFormatItem.classList.add("visible");
      }

      const topLiEl = document.createElement("li");
      topLiEl.innerHTML =
        "<div class='icon' data-icon='" +
        format.icon +
        "'></div><span class='format-title'>" +
        format.title +
        "<br/><br/><span class='sub-title'>" +
        format.sub_title +
        "</span></span><div class='format-buttons'><button class='format-button save-changes' id='" +
        format.value +
        "_save_changes'>Save Changes</button></div>";
      newMainColorFormatItem.appendChild(topLiEl);
      const bottomLiEl = document.createElement("li");
      bottomLiEl.classList.add("editor");
      bottomLiEl.setAttribute("id", format.value + "_editor");
      newMainColorFormatItem.appendChild(bottomLiEl);
      document
        .querySelector(".formats-main-frame")
        .appendChild(newMainColorFormatItem);

      const flask = new CodeFlask("#" + format.value + "_editor", {
        language: "js",
        defaultTheme: false
      });
      flask.updateCode(format.file);
      document
        .getElementById(format.value + "_save_changes")
        .addEventListener("click", e => {
          ipcRenderer.invoke(
            "FORMAT",
            JSON.parse(
              JSON.stringify({
                type: "SAVE_FORMAT",
                args: {
                  value: format.value,
                  file: flask.getCode(),
                  new: false
                }
              })
            )
          );
        });
    });
  }

  /**
   * Setup the EventListeners for all the setting options i.e. checkboxes input fields, etc.
   *
   * @memberof SettingsWindow
   */
  _ConfigureEventListeners() {
    document.getElementById("close-window").addEventListener("click", e => {
      ipcRenderer.invoke("WINDOW", { type: "HIDE", windowName: "settings" });
    });

    // Navigation Control
    [...document.getElementsByClassName("navbar-item")].forEach((el, index) => {
      el.addEventListener("click", e => {
        const viewName = el.getAttribute("data-linked-view");
        const settingsFrame = document.querySelector(
          ".settings-frame[data-view='" + viewName + "']"
        );
        if (settingsFrame) {
          document
            .querySelector(".navbar-item.active")
            .classList.remove("active");
          el.classList.add("active");
          document
            .querySelector(".settings-frame.visible")
            .classList.remove("visible");
          settingsFrame.classList.add("visible");

          if (viewName == "about") {
            document.getElementById("drop-framework-versions").innerHTML =
              '<svg aria-hidden="true" focusable="false" data-prefix="fab" data-icon="node-js" class="svg-inline--fa fa-node-js fa-w-14" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M224 508c-6.7 0-13.5-1.8-19.4-5.2l-61.7-36.5c-9.2-5.2-4.7-7-1.7-8 12.3-4.3 14.8-5.2 27.9-12.7 1.4-.8 3.2-.5 4.6.4l47.4 28.1c1.7 1 4.1 1 5.7 0l184.7-106.6c1.7-1 2.8-3 2.8-5V149.3c0-2.1-1.1-4-2.9-5.1L226.8 37.7c-1.7-1-4-1-5.7 0L36.6 144.3c-1.8 1-2.9 3-2.9 5.1v213.1c0 2 1.1 4 2.9 4.9l50.6 29.2c27.5 13.7 44.3-2.4 44.3-18.7V167.5c0-3 2.4-5.3 5.4-5.3h23.4c2.9 0 5.4 2.3 5.4 5.3V378c0 36.6-20 57.6-54.7 57.6-10.7 0-19.1 0-42.5-11.6l-48.4-27.9C8.1 389.2.7 376.3.7 362.4V149.3c0-13.8 7.4-26.8 19.4-33.7L204.6 9c11.7-6.6 27.2-6.6 38.8 0l184.7 106.7c12 6.9 19.4 19.8 19.4 33.7v213.1c0 13.8-7.4 26.7-19.4 33.7L243.4 502.8c-5.9 3.4-12.6 5.2-19.4 5.2zm149.1-210.1c0-39.9-27-50.5-83.7-58-57.4-7.6-63.2-11.5-63.2-24.9 0-11.1 4.9-25.9 47.4-25.9 37.9 0 51.9 8.2 57.7 33.8.5 2.4 2.7 4.2 5.2 4.2h24c1.5 0 2.9-.6 3.9-1.7s1.5-2.6 1.4-4.1c-3.7-44.1-33-64.6-92.2-64.6-52.7 0-84.1 22.2-84.1 59.5 0 40.4 31.3 51.6 81.8 56.6 60.5 5.9 65.2 14.8 65.2 26.7 0 20.6-16.6 29.4-55.5 29.4-48.9 0-59.6-12.3-63.2-36.6-.4-2.6-2.6-4.5-5.3-4.5h-23.9c-3 0-5.3 2.4-5.3 5.3 0 31.1 16.9 68.2 97.8 68.2 58.4-.1 92-23.2 92-63.4z"></path></svg> ' +
              process.version +
              '<br/> <svg aria-hidden="true" focusable="false" data-prefix="fal" data-icon="atom" class="svg-inline--fa fa-atom fa-w-14" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M224,200a56,56,0,1,0,56.00149,56A56.06868,56.06868,0,0,0,224,200Zm0,80a24,24,0,1,1,24.00064-24A24.00651,24.00651,0,0,1,224,280Zm188.72376-24c15.56292-20.26562,26.71946-40.625,31.9071-60,6.03141-22.60938,3.9376-43.42188-6.06266-60.1875-18.21924-30.5-60.34535-42.96875-113.503-38.4375C301.81457,37.8125,265.5636,0,224,0S146.18543,37.8125,122.96607,97.375c-53.18892-4.53125-95.315,7.92188-113.503,38.4375C-.56846,152.57812-2.66227,173.39062,3.36914,196c5.18764,19.375,16.34418,39.73438,31.9071,60-15.56292,20.26562-26.71946,40.625-31.9071,60-6.03141,22.60938-3.9376,43.42188,6.06266,60.1875,15.84417,26.5,49.59507,39.51562,93.03372,39.51562,6.37517,0,13.50036-1.14062,20.25054-1.70312C145.96668,473.92188,182.31139,512,224,512s78.03332-38.07812,101.28394-98c6.75018.5625,13.87537,1.70312,20.25054,1.70312,43.4074,0,77.18955-13.01562,93.00247-39.51562,10.03151-16.76562,12.12532-37.57812,6.09391-60.1875C439.44322,296.625,428.28668,276.26562,412.72376,256ZM36.90128,359.78125c-5.5314-9.29687-6.43767-21.25-2.59382-35.5,3.68682-13.71875,11.59406-28.40625,22.3131-43.29687A400.69639,400.69639,0,0,0,99.93421,319.4375a432.51171,432.51171,0,0,0,12.59408,63.9375C74.80854,385.3125,47.1203,376.84375,36.90128,359.78125Zm59.53283-85.04687Q86.16822,265.42969,77.3086,256q8.85962-9.44532,19.12551-18.73438c-.21875,6.21876-.46876,12.39063-.46876,18.73438S96.21536,268.51562,96.43411,274.73438Zm3.5001-82.17188a397.74293,397.74293,0,0,0-43.31365,38.45312c-10.719-14.89062-18.62628-29.57812-22.3131-43.29687-3.84385-14.25-2.93758-26.20313,2.62507-35.5,9.219-15.46875,32.71962-23.98437,65.158-23.98437,3.31259,0,6.90644.28124,10.43778.45312A431.64065,431.64065,0,0,0,99.93421,192.5625Zm211.75562-25.5c-8.37522-5.32812-16.87545-10.57812-25.81319-15.54688-6.43767-3.57812-12.84409-6.90624-19.28176-10.14062a338.66891,338.66891,0,0,1,36.56347-8.8125C306.00139,141.96875,309.81478,157.42188,311.68983,167.0625ZM224,32c24.06314,0,49.53257,26.03125,68.18931,69.96875A407.59456,407.59456,0,0,0,224,122.3125a405.98246,405.98246,0,0,0-68.18931-20.35938C174.46743,58.01562,199.93686,32,224,32ZM144.84165,132.5625a336.43586,336.43586,0,0,1,36.53222,8.8125c-6.40642,3.23438-12.84409,6.5625-19.25051,10.14062-8.93774,4.96876-17.438,10.21876-25.81319,15.54688C138.18522,157.42188,141.997,141.96875,144.84165,132.5625Zm-8.53148,212.375c8.37522,5.32812,16.87545,10.57812,25.81319,15.54688,6.71893,3.75,13.37535,6.48437,20.09428,9.85937a344.234,344.234,0,0,1-37.376,9.125A355.36907,355.36907,0,0,1,136.31017,344.9375ZM224,480c-24.15689,0-49.72007-26.23438-68.40807-70.48438A402.25348,402.25348,0,0,0,224,389.20312a402.25348,402.25348,0,0,0,68.40807,20.3125C273.72007,453.76562,248.15689,480,224,480Zm79.15835-100.54688a341.68756,341.68756,0,0,1-37.34474-9.10937c6.71893-3.375,13.37536-6.10937,20.063-9.85937,8.93774-4.96876,17.46922-10.21876,25.84444-15.53126C309.31477,357.15625,306.40844,368.625,303.15835,379.45312Zm14.71914-77.39062a471.236,471.236,0,0,1-47.56376,30.48438,475.86157,475.86157,0,0,1-46.28248,22.60937,476.691,476.691,0,0,1-46.345-22.60937,471.236,471.236,0,0,1-47.56376-30.48438c-1.375-14.71875-2.15631-30.07812-2.15631-46.0625s.78127-31.34375,2.15631-46.0625a471.236,471.236,0,0,1,47.56376-30.48438A477.44789,477.44789,0,0,1,224,156.76562a477.44789,477.44789,0,0,1,46.31373,22.6875,471.236,471.236,0,0,1,47.56376,30.48438c1.375,14.71875,2.15631,30.07812,2.15631,46.0625S319.25253,287.34375,317.87749,302.0625Zm28.06325-173.82812c32.40711,0,55.90773,8.51562,65.158,23.96874,5.5314,9.3125,6.43767,21.25,2.59382,35.5-3.68839,13.73438-11.59406,28.40626-22.3131,43.3125a396.1044,396.1044,0,0,0-43.31365-38.45312,435.36835,435.36835,0,0,0-12.56283-63.875C339.003,128.5,342.5969,128.23438,345.94074,128.23438Zm5.62515,109.03124Q361.83179,246.57032,370.6914,256q-8.85962,9.44532-19.12551,18.73438c.21875-6.21876.46876-12.39063.46876-18.73438S351.78464,243.48438,351.56589,237.26562Zm59.50158,122.51563c-10.15652,17.0625-37.84476,25.53125-75.59576,23.5625a432.07594,432.07594,0,0,0,12.59408-63.90625,397.74293,397.74293,0,0,0,43.31365-38.45312c10.719,14.89062,18.62471,29.57812,22.3131,43.29687C417.53639,338.53125,416.63012,350.48438,411.06747,359.78125Z"></path></svg>' +
              process.versions.electron +
              '<br/> <svg aria-hidden="true" focusable="false" data-prefix="fab" data-icon="chrome" class="svg-inline--fa fa-chrome fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512"><path fill="currentColor" d="M131.5 217.5L55.1 100.1c47.6-59.2 119-91.8 192-92.1 42.3-.3 85.5 10.5 124.8 33.2 43.4 25.2 76.4 61.4 97.4 103L264 133.4c-58.1-3.4-113.4 29.3-132.5 84.1zm32.9 38.5c0 46.2 37.4 83.6 83.6 83.6s83.6-37.4 83.6-83.6-37.4-83.6-83.6-83.6-83.6 37.3-83.6 83.6zm314.9-89.2L339.6 174c37.9 44.3 38.5 108.2 6.6 157.2L234.1 503.6c46.5 2.5 94.4-7.7 137.8-32.9 107.4-62 150.9-192 107.4-303.9zM133.7 303.6L40.4 120.1C14.9 159.1 0 205.9 0 256c0 124 90.8 226.7 209.5 244.9l63.7-124.8c-57.6 10.8-113.2-20.8-139.5-72.5z"></path></svg>' +
              process.versions.chrome +
              '<br/><br/> <a href="#" id="openLogDirectory">Logs</a>';
            document.getElementById("drop-version").innerHTML =
              "Drop <div class='version'>Version " +
              packageJSON.version +
              "</div>";
            document
              .getElementById("openLogDirectory")
              .addEventListener("click", e => {
                ipcRenderer.invoke("open-logs");
                e.preventDefault();
              });
          }
        } else {
          console.warn("Couldn't find that settings frame, doing nothing");
        }
      });
    });

    // Setup checkbox event listeners
    this._CheckboxSettingKeys.forEach(settingKey => {
      const checkboxEl = document.getElementById(settingKey);
      if (checkboxEl) {
        checkboxEl.addEventListener("change", e => {
          ipcRenderer.invoke("SETTING", {
            type: "MODIFY_SETTING",
            args: {
              key: settingKey,
              value: checkboxEl.checked
            }
          });
          switch (settingKey) {
            case "isHistoryLimit":
              if (checkboxEl.checked) {
                document
                  .getElementById("historyLimit")
                  .removeAttribute("disabled");
              } else {
                document
                  .getElementById("historyLimit")
                  .setAttribute("disabled", "true");
              }
          }
        });
      } else {
        console.warn("Couldn't find checkbox for key", settingKey);
      }
    });

    /* GENERAL */
    const historyLimitEl = document.getElementById("historyLimit");
    historyLimitEl.addEventListener("change", e => {
      ipcRenderer.invoke("SETTING", {
        type: "MODIFY_SETTING",
        args: { key: "historyLimit", value: historyLimitEl.value }
      });
    });

    const colorProfileEl = document.getElementById("colorProfile");
    colorProfileEl.addEventListener("change", e => {
      ipcRenderer.invoke("SETTING", {
        type: "MODIFY_SETTING",
        args: { key: "colorProfile", value: colorProfileEl.value }
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
          document.getElementById("lastUpdateCheck").innerHTML =
            "Last checked " + moment(new Date().getTime()).fromNow();
          document.getElementById("update-status").innerHTML =
            "Checking For Updates";
          ipcRenderer
            .invoke("SETTING", { type: "CHECK_UPDATE" })
            .then(data => {
              if (data.error !== null) {
                console.error(data.error);
                document.getElementById("update-status").innerHTML =
                  "Error Occurred Finding Updates";
                updateButtonEl.removeAttribute("disabled");
              }
            })
            .catch(err => {
              console.error(err);
              document.getElementById("update-status").innerHTML =
                "Error Occurred Finding Updates";
              updateButtonEl.removeAttribute("disabled");
            });
        } else if (updateButtonEl.getAttribute("data-function") == "download") {
          ipcRenderer
            .invoke("SETTING", { type: "DOWNLOAD_UPDATE" })
            .catch(err => {
              console.error(err);
              document.getElementById("update-status").innerHTML =
                "Error Occurred Downloading Updates";
              updateButtonEl.removeAttribute("disabled");
            });
        } else if (updateButtonEl.getAttribute("data-function") == "install") {
          ipcRenderer
            .invoke("SETTING", { type: "INSTALL_UPDATE" })
            .catch(err => {
              console.error(err);
              document.getElementById("update-status").innerHTML =
                "Error Occurred Installing Updates";
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
      this._setSettings();
      document.getElementById("update-status").innerHTML = "Update Available";
      updateButtonEl.value = "Download Update";
      updateButtonEl.setAttribute("data-function", "download");
      updateButtonEl.removeAttribute("disabled");
    });

    // Updater didn't find a newer version
    ipcRenderer.on("UPDATER-UPDATE-UNAVAILABLE", () => {
      this._setSettings();
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

    /* FORMATS */

    document.getElementById("formats-new").addEventListener("click", e => {
      const colorFormatListEl = document.getElementById("all-formats-list");
      const newColorFormatItem = document.createElement("li");
      const tempName = "tempName";
      newColorFormatItem.setAttribute("data-sidebar-nav", tempName);
      newColorFormatItem.innerHTML = "New Format";
      newColorFormatItem.addEventListener("click", e => {
        document
          .querySelector(".formats-sidebar ul li.active")
          .classList.remove("active");
        newColorFormatItem.classList.add("active");
        document
          .querySelector(".formats-main-frame ul.visible")
          .classList.remove("visible");
        document
          .querySelector(
            ".formats-main-frame ul[data-format-group='" + tempName + "']"
          )
          .classList.add("visible");
      });
      colorFormatListEl.appendChild(newColorFormatItem);

      const newMainColorFormatItem = document.createElement("ul");
      newMainColorFormatItem.setAttribute("data-format-group", tempName);

      const topLiEl = document.createElement("li");
      topLiEl.innerHTML =
        "<div class='icon' data-icon='unknown'></div><span class='format-title'>New Format<br/><br/><span class='sub-title'></span></span><div class='format-buttons'><button class='format-button save-changes' id='" +
        tempName +
        "_save_changes'>Save Changes</button></div>";
      newMainColorFormatItem.appendChild(topLiEl);
      const bottomLiEl = document.createElement("li");
      bottomLiEl.classList.add("editor");
      bottomLiEl.setAttribute("id", tempName + "_editor");
      newMainColorFormatItem.appendChild(bottomLiEl);
      document
        .querySelector(".formats-main-frame")
        .appendChild(newMainColorFormatItem);

      const flask = new CodeFlask("#" + tempName + "_editor", {
        language: "js",
        defaultTheme: false
      });
      flask.updateCode(
        "// setup basic information for plugin\n" +
          "exports.config = () => ({\n" +
          '  name: "' +
          tempName +
          '",\n' +
          '  type: "format",\n' +
          "  format: {\n" +
          '    displayName: "New Format",\n' +
          '    displayFormat: "",\n' +
          '    icon: "unknown"\n' +
          "  }\n" +
          "});\n" +
          "\n" +
          "// convert the inputted color object format\n" +
          "// into another format and return the final\n" +
          "// string value\n" +
          "exports.convertColor = color => {\n" +
          '  return "#" + color.hex.toUpperCase();\n' +
          "};\n" +
          ""
      );
      document
        .getElementById(tempName + "_save_changes")
        .addEventListener("click", e => {
          ipcRenderer.invoke(
            "FORMAT",
            JSON.parse(
              JSON.stringify({
                type: "SAVE_FORMAT",
                args: {
                  value: tempName,
                  file: flask.getCode(),
                  new: true
                }
              })
            )
          );
        });
    });

    document.getElementById("formats-delete").addEventListener("click", e => {
      const menuItem = document.querySelector(".formats-sidebar ul li.active");
      const name = menuItem.getAttribute("data-sidebar-nav");
      ipcRenderer.invoke("FORMAT", {
        type: "DELETE_FORMAT",
        args: {
          value: name
        }
      });
      menuItem.parentNode.removeChild(menuItem);
      document.querySelectorAll(".formats-sidebar ul li")[0].click();
    });

    /* PICKER */

    const pollingRateEl = document.getElementById("pollingRate");
    pollingRateEl.addEventListener("change", e => {
      ipcRenderer.invoke("SETTING", {
        type: "MODIFY_SETTING",
        args: { key: "pollingRate", value: pollingRateEl.value }
      });
    });

    /* SHORTCUTS */

    const shortcutSidebarItemEl = document.querySelectorAll(
      ".shortcut-sidebar ul li"
    );
    shortcutSidebarItemEl.forEach((shortcutCategoryItem, index) => {
      shortcutCategoryItem.addEventListener("click", e => {
        document
          .querySelector(".shortcut-sidebar ul li.active")
          .classList.remove("active");
        shortcutCategoryItem.classList.add("active");
        document
          .querySelector(".shortcut-main-frame ul.visible")
          .classList.remove("visible");
        document
          .querySelector(
            ".shortcut-main-frame ul[data-shortcut-group='" +
              shortcutCategoryItem.getAttribute("data-sidebar-nav") +
              "']"
          )
          .classList.add("visible");
      });
    });

    const keyCaptureEls = document.querySelectorAll(".shortcut-keys");
    let oldShortcut;

    const resetShortcutCapture = () => {
      const activeShortcutElement = document.querySelector(
        ".shortcut-keys.shortcut-active"
      );
      if (activeShortcutElement) {
        if (activeShortcutElement.innerHTML === "<ul></ul>") {
          // TODO: Check if new shortcut is valid i.e. using a shortcut with only Control is not valid
          document.querySelector(
            ".shortcut-keys.shortcut-active"
          ).innerHTML = oldShortcut;
        } else {
          // store new keyboard shortcut
          const shortcutFor = activeShortcutElement.getAttribute(
            "data-shortcut-for"
          );
          // get keys
          const keys = [];
          activeShortcutElement
            .querySelectorAll("ul li")
            .forEach((key, index) => {
              keys.push(key.getAttribute("data-key"));
            });

          ipcRenderer.invoke("SETTING", {
            type: "MODIFY_SETTING",
            args: { key: shortcutFor + "Keys", value: keys }
          });
        }
        document
          .querySelector(".shortcut-keys.shortcut-active")
          .classList.remove("shortcut-active");
        document.removeEventListener("keydown", onKeyDown);
        ipcRenderer.invoke("SETTING", {
          type: "ENABLE_SHORTCUTS",
          args: {}
        });
      }
    };

    this.keyDownTimeout = null;
    const onKeyDown = e => {
      if (document.querySelector(".shortcut-keys.shortcut-active")) {
        const kEl = document.querySelector(".shortcut-keys.shortcut-active ul");
        let keyAlreadyUsed = false;
        const keyItemElements = kEl.querySelectorAll("li");
        keyItemElements.forEach((existingKey, index) => {
          if (
            existingKey.getAttribute("data-key") === e.key.toString() &&
            existingKey.getAttribute("data-key-code") === e.keyCode.toString()
          ) {
            keyAlreadyUsed = true;
          }
        });
        if (!keyAlreadyUsed && [...keyItemElements].length < 4) {
          const newKey = document.createElement("li");
          newKey.setAttribute("data-key", e.key);
          newKey.setAttribute("data-key-code", e.keyCode);
          const keyName = this._KeyFormatter.format(e.key);
          newKey.innerHTML = keyName;
          kEl.appendChild(newKey);
        }
      }
    };

    document.addEventListener("keyup", e => {
      resetShortcutCapture();
    });

    document.addEventListener("click", e => {
      if (!e.target.classList.contains("shortcut-active")) {
        resetShortcutCapture();
      }
    });

    keyCaptureEls.forEach((keyCaptureEl, index) => {
      keyCaptureEl.addEventListener("click", e => {
        if (document.querySelector(".shortcut-keys.shortcut-active")) {
          resetShortcutCapture();
        }
        keyCaptureEl.classList.add("shortcut-active");
        oldShortcut = keyCaptureEl.innerHTML;
        keyCaptureEl.innerHTML = "<ul></ul>";
        document.addEventListener("keydown", onKeyDown);
        // unregister all global shortcuts
        ipcRenderer.invoke("SETTING", {
          type: "DISABLE_SHORTCUTS",
          args: {}
        });
        e.preventDefault();
      });
    });
  }
}

new SettingsWindow();
