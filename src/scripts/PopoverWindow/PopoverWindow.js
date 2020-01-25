const { remote, ipcRenderer } = require('electron');

class PopoverWindow {

  constructor() {
    this._ID = null;
    this._ConfigureEventListeners();
  }

  /**
   * Setup IPC listener
   */
  _ConfigureEventListeners() {
    console.log("Setup IPC Listening, waiting on messages...")
    ipcRenderer.on("options", (event, opts) => {
      console.log("Received Options Event",opts);
      this._ID = opts.id;
      const optionsListEl = document.getElementById("option-list");
      opts.options.forEach((option, index) => {
        console.log(option);
        const optItem = document.createElement("li");
        optItem.setAttribute("data-type", option.value);
        optItem.setAttribute("data-icon", option.icon);
        if (option.isSeparator === true) {
          optItem.classList.add("separator");
        } else {
          optItem.innerHTML = '<div class="icon"></div>'+
                              '<div class="name">'+option.title+'</div>'+
                              '<div class="format">'+option.sub_title+'</div>';
        }
        optItem.addEventListener("click", (e) => {
          console.log("Sending to channel; ","options-"+this._ID+"-click-"+option._id);
          ipcRenderer.sendTo(opts.originatingWebContentId, "options-"+this._ID+"-click-"+option._id, option.value);
          remote.getCurrentWindow().hide();
        }, false);
        optionsListEl.appendChild(optItem);
      });

    });
  }

}

const pw = new PopoverWindow();
