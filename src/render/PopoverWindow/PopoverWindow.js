const Sentry = require("@sentry/electron");

Sentry.init({ dsn: process.env.DSN });

const { ipcRenderer } = require("electron");

/**
 * Popover Window Class
 * In charge of handling popover renderer processes
 */
class PopoverWindow {
  /**
   * Initiate a new popover window
   */
  constructor() {
    /** The popover's window ID */
    this._ID = null;
    this._ConfigureEventListeners();
  }

  /**
   * Setup IPC listeners
   */
  _ConfigureEventListeners() {
    // options listener, listens for when the parent window sends the select
    // options for this popover window
    ipcRenderer.on("options", (event, opts) => {
      this._ID = opts.id;
      const optionsListEl = document.getElementById("option-list");
      opts.options.forEach(option => {
        // Create a new select option, li element
        const optItem = document.createElement("li");
        optItem.setAttribute("data-type", option.value);
        optItem.setAttribute("data-icon", option.icon);
        // Check if separator or a select option
        if (option.isSeparator === true) {
          optItem.classList.add("separator");
        } else {
          optItem.innerHTML =
            '<div class="icon"></div>' +
            '<div class="name">' +
            option.title +
            "</div>" +
            '<div class="format">' +
            option.sub_title +
            "</div>";
          // Add click event listener to the select option
          optItem.addEventListener(
            "click",
            () => {
              const ipcChannelName =
                "options-" + this._ID + "-click-" + option._id;
              ipcRenderer.send(ipcChannelName, option.value);
              ipcRenderer.invoke("WINDOW", {
                type: "HIDE",
                windowName: "popover"
              });
            },
            false
          );
        }
        optionsListEl.appendChild(optItem);
      });
    });
  }
}

new PopoverWindow();
