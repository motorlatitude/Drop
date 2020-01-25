const { remote, ipcRenderer } =  require('electron');

class Palette {

  /**
   * Initiate a palette class
   * @param {*} p A palette object
   */
  constructor(p) {
    this._Colors = p.colors;
    this._Name = p.name;
    this._ID = p.id;
  }

  /**
   * Create the palette element and generate eventListeners, should be followed by an
   * this.AppendNewPalette() method.
   */
  CreateElement() {
    let elColorList;

    // Fetch or create ul for placing colors in
    if (this._ID == "HISTORY") {
      elColorList = document.getElementById("template-palette");
    } else {
      const templatePalette = document.getElementById("template-palette").cloneNode(true);
      templatePalette.id = this._ID;
      templatePalette.querySelector(".title>.name").innerHTML = this._Name;
      templatePalette.querySelector(".title>.options>.expanded-options>ul>.delete-palette").classList.remove("disabled");
      templatePalette.querySelector(".history").innerHTML = "<ul></ul>";

      // add drop listener to allow user to drag other colors into this palette
      templatePalette.querySelector(".history>ul").addEventListener("drop", (e) => {
        e.preventDefault();
        const color = e.dataTransfer.getData('text');
        this._Colors.push(color);
        ipcRenderer.send("save-palette", this.Resolve());
        this.AppendNewColorItem(templatePalette.querySelector(".history>ul"), color);
      });

      // dragover listener required
      templatePalette.querySelector(".history>ul").addEventListener("dragover", (e) => {
        e.preventDefault();
      });

      elColorList = templatePalette;
    }

    // reveal palette options on hover
    elColorList.querySelector(".options").addEventListener("mouseover", (evt) => {
      elColorList.querySelector(".options>.expanded-options").classList.add("display");
    });

    // hide palette options on ending hover
    elColorList.querySelector(".options").addEventListener("mouseout", (evt) => {
      elColorList.querySelector(".options>.expanded-options").classList.remove("display");
    });

    // Trash Event Listener
    elColorList.querySelector(".title>.options>.expanded-options>ul>.delete-palette").addEventListener("click", (e) => {
      // clicked trash, delete palette
      if (!elColorList.querySelector(".title>.options>.expanded-options>ul>.delete-palette").classList.contains("disabled")) {
        ipcRenderer.send("delete-palette", this._ID);
        this.RemovePalette(elColorList);
        const currentWindowBounds = remote.getCurrentWindow().getBounds();
        remote.getCurrentWindow().setBounds({
            height: currentWindowBounds.height - 110,
            y: currentWindowBounds.y + 110
        }, true);
      }
    });

    for (let i=0; i < this._Colors.length; i++) {
      const color = this._Colors[i];
      this.AppendNewColorItem(elColorList.querySelector(".history>ul"), color);
    }

    return elColorList;

  }

  /**
   * Append a new palette to the list
   * @param {*} el the created element from this.CreateElement()
   */
  AppendNewPalette(el) {
    document.getElementById("palettes").appendChild(el);
  }

  /**
   * Remove palette from the list
   * @param {*} el the palette element to be removed
   */
  RemovePalette(el) {
    document.getElementById("palettes").removeChild(el);
  }

  /**
   * Append a new color item to a palette
   * @param {*} color
   */
  AppendNewColorItem(elColorList, color) {
    let elColorItem = document.createElement("li");
    elColorItem.setAttribute("style","background: #"+color+";");
    elColorItem.setAttribute("draggable","true");
    this.GenerateEventListeners(elColorItem, color);
    if(elColorList.childNodes[0]) {
      elColorList.childNodes[0].after(elColorItem);
    } else {
      elColorList.appendChild(elColorItem);
    }
  }

  /**
   * Generate event listeners for color items
   * @param {*} el
   */
  GenerateEventListeners(el, color) {
    // Click Handler
    el.addEventListener("click", (e) => {
      ipcRenderer.send("clicked", color);
      // remove color if in history palette as it will get added to the front
      if (this._ID == "HISTORY") {
        document.querySelector("#template-palette>.history>ul").removeChild(el);
      }
    }, false);

    let [temporaryPalette, temporaryPaletteElement] = [undefined, undefined];
    // DragStart Handler
    el.addEventListener("dragstart", (e) => {
      console.log("Starting Drag");
      e.target.classList.add("dragging");

      // set ghost overlay image
      var elem = document.createElement("div");
      elem.id = "drag-ghost";
      elem.style.position = "absolute";
      elem.style.top = "-1000px";
      elem.style.backgroundColor = "#"+color;
      document.body.appendChild(elem);
      e.dataTransfer.setDragImage(elem, 0, 0);

      // set data transfer type and data
      e.dataTransfer.setData("text/plain", color);
      e.dataTransfer.dropEffect = "copy";

      // Increase size of window to accommodate
      const currentWindowBounds = remote.getCurrentWindow().getBounds();
      remote.getCurrentWindow().setBounds({
          height: currentWindowBounds.height + 110,
          y: currentWindowBounds.y - 110
      }, true);
      [temporaryPalette, temporaryPaletteElement] = this.GenerateTemporaryPalette();

    }, false);

    // DragEnd Handler
    el.addEventListener("dragend", (e) => {
      console.log("Ending Drag");
      e.target.classList.remove("dragging");
      if (temporaryPaletteElement && temporaryPaletteElement.querySelectorAll(".history>ul>li").length > 0) {
        // save palette
        ipcRenderer.send("save-palette", temporaryPalette.Resolve());
        [temporaryPalette, temporaryPaletteElement] = [undefined, undefined];
      } else {
        const currentWindowBounds = remote.getCurrentWindow().getBounds();
        remote.getCurrentWindow().setBounds({
            height: currentWindowBounds.height - 110,
            y: currentWindowBounds.y + 110
        }, true);
        // remove temp palette
        temporaryPalette.RemovePalette(temporaryPaletteElement);
        [temporaryPalette, temporaryPaletteElement] = [undefined, undefined];
      }
      // clear generated ghost element
      const dragGhostEl = document.getElementById("drag-ghost");
      dragGhostEl.parentNode.removeChild(dragGhostEl);
    }, false);
  }

  /**
   * Creates a temporary new palette for the user to use when dragging colors
   */
  GenerateTemporaryPalette() {
    // Create New Blank Palette
    const p = new Palette({
      colors: [],
      name: "New Color Palette",
      id: Math.random().toString(36).substr(2, 9)
    });
    const newPaletteEl = p.CreateElement();
    p.AppendNewPalette(newPaletteEl);
    return [p, newPaletteEl];
  }

  /**
   * Resolve Palette back to object for storage
   */
  Resolve() {
    return {
      name: this._Name,
      colors: this._Colors,
      id: this._ID
    }
  }

}

module.exports = Palette;
