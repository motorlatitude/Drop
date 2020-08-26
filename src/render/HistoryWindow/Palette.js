const { ipcRenderer } = require("electron");

/**
 * Palette Class
 * Corresponds to an individual palette in the History Window
 */
class Palette {
  /**
   * Initiate a palette class
   * @param {*} p A palette object
   */
  constructor(p) {
    this._Colors = p.colors;
    this._Name = p.name;
    this._ID = p.id;
    this._prevDeleteColor = undefined;
  }

  /**
   * Create the palette element and generate eventListeners, should be followed by an
   * Palette.AppendNewPalette() method.
   * @return {*}
   */
  createElement() {
    let elColorList;

    // Fetch or create ul for placing colors in
    if (this._ID == "HISTORY") {
      elColorList = document.getElementById("template-palette");
    } else {
      const templatePalette = document
        .getElementById("template-palette")
        .cloneNode(true);
      templatePalette.id = this._ID;
      const pNameEl = templatePalette.getElementsByClassName("palette-name")[0];
      pNameEl.contentEditable = true;
      pNameEl.innerHTML = this._Name;
      pNameEl.addEventListener("input", e => {
        this._Name = pNameEl.innerText;
        ipcRenderer
          .invoke("PALETTE", {
            type: "SAVE",
            args: this.serialize()
          })
          .catch(err => {
            console.warn(err);
          });
      });
      templatePalette
        .getElementsByClassName("delete-palette")[0]
        .classList.remove("disabled");
      templatePalette.getElementsByClassName("history")[0].innerHTML =
        "<ul class='color-palette-list'></ul>";

      const colorPaletteListEl = templatePalette.getElementsByClassName(
        "color-palette-list"
      )[0];

      // add drop listener to allow user to drag other colors into this palette
      colorPaletteListEl.addEventListener("drop", e => {
        e.preventDefault();
        const color = e.dataTransfer.getData("text");
        this._Colors.push(color);
        ipcRenderer
          .invoke("PALETTE", { type: "SAVE", args: this.serialize() })
          .catch(err => {
            console.warn(err);
          });
        this.appendNewColorItem(colorPaletteListEl, color);
      });

      // dragover listener required
      colorPaletteListEl.addEventListener("dragover", e => {
        e.preventDefault();
      });

      elColorList = templatePalette;
    }

    const elColorListOptions = elColorList.getElementsByClassName("options")[0];
    const elColorListDeleteOption = elColorListOptions.getElementsByClassName(
      "delete-palette"
    )[0];
    const elColorListClearOption = elColorListOptions.getElementsByClassName(
      "clear-palette"
    )[0];

    // reveal & hide palette options on hover
    elColorListOptions.addEventListener("mouseover", evt => {
      elColorListOptions
        .getElementsByClassName("expanded-options")[0]
        .classList.add("display");
    });
    elColorListOptions.addEventListener("mouseout", evt => {
      elColorListOptions
        .getElementsByClassName("expanded-options")[0]
        .classList.remove("display");
    });

    // Trash Event Listener
    elColorListDeleteOption.addEventListener("click", async e => {
      // clicked trash, delete palette
      if (!elColorListDeleteOption.classList.contains("disabled")) {
        ipcRenderer
          .invoke("PALETTE", { type: "DELETE", args: this._ID })
          .catch(err => {
            console.warn(err);
          });
        this.removePalette(elColorList);
        this.changeHistoryWindowBounds(-110, 110);
      }
    });

    // Clear Event Listener
    elColorListClearOption.addEventListener("click", async e => {
      // clicked clear, clear palette
      if (!elColorListClearOption.classList.contains("disabled")) {
        this._Colors = [];
        elColorList.getElementsByClassName("color-palette-list")[0].innerHTML =
          "";
        ipcRenderer
          .invoke("PALETTE", { type: "SAVE", args: this.serialize() })
          .catch(err => {
            console.warn(err);
          });
      }
    });

    for (let i = 0; i < this._Colors.length; i++) {
      const color = this._Colors[i];
      this.appendNewColorItem(
        elColorList.getElementsByClassName("color-palette-list")[0],
        color
      );
    }

    return elColorList;
  }

  /**
   * Change the bounds of the history window for adding/removing palettes. This
   * will increase or decrease the height and adjust the y coordinate
   * accordingly
   *
   * @param {number} heightModifier the amount to increase or decrease the height
   * @param {number} yModifier the amount to increase or decrease the y coordinate
   * @memberof Palette
   */
  async changeHistoryWindowBounds(heightModifier, yModifier) {
    const windowBounds = await ipcRenderer.invoke("WINDOW", {
      type: "GET_BOUNDS",
      windowName: "history"
    });
    ipcRenderer
      .invoke("WINDOW", {
        type: "SET_BOUNDS",
        windowName: "history",
        args: {
          height: windowBounds.height + heightModifier,
          y: windowBounds.y + yModifier,
          animate: true
        }
      })
      .catch(err => {
        console.warn(err);
      });
  }

  /**
   * Append a new palette to the list
   * @param {*} el the created element from this.CreateElement()
   */
  appendNewPalette(el) {
    document.getElementById("palettes").appendChild(el);
  }

  /**
   * Remove palette from the list
   * @param {*} el the palette element to be removed
   */
  removePalette(el) {
    document.getElementById("palettes").removeChild(el);
  }

  /**
   * Append a new color item to a palette
   * @param {*} elColorList
   * @param {*} color
   */
  appendNewColorItem(elColorList, color) {
    const elColorItem = document.createElement("li");
    elColorItem.setAttribute("style", "background: #" + color + ";");
    elColorItem.setAttribute("draggable", "true");
    this.generateEventListeners(elColorItem, color);
    elColorList.prepend(elColorItem);
  }

  /**
   * Generate event listeners for color items
   * @param {*} el
   * @param {string} color
   */
  generateEventListeners(el, color) {
    // Click Handler
    el.addEventListener(
      "click",
      e => {
        ipcRenderer
          .invoke("PICKER", { type: "PICKED", args: { color } })
          .catch(err => {
            console.warn(err);
          });
        // remove color if in history palette as it will get added to the front
        if (this._ID == "HISTORY") {
          document
            .querySelector("#template-palette>.history>ul")
            .removeChild(el);
        }
      },
      false
    );

    // Right-Click Handler (color will be deleted from palette)
    el.addEventListener(
      "contextmenu",
      e => {
        const menu = document.getElementById("menu");
        menu.classList.add("visible");
        menu.style.top = e.clientY + "px";
        if (e.clientY + menu.clientHeight > window.innerHeight) {
          menu.style.top = e.clientY - menu.clientHeight + "px";
        }
        menu.style.left = e.clientX + "px";
        if (e.clientX + 120 > window.innerWidth) {
          menu.style.left = e.clientX - 120 + "px";
        }

        const deleteColor = () => {
          if (el.parentElement) {
            const index = [...el.parentElement.children].indexOf(el);
            this._Colors.splice(this._Colors.length - index - 1, 1);
            el.parentNode.removeChild(el);
            ipcRenderer
              .invoke("PALETTE", {
                type: "SAVE",
                args: this.serialize()
              })
              .catch(err => {
                console.warn(err);
              });
            document
              .getElementById("context-menu-delete")
              .removeEventListener("click", deleteColor);
            menu.classList.remove("visible");
          }
        };
        if (this._prevDeleteColor) {
          document
            .getElementById("context-menu-delete")
            .removeEventListener("click", this._prevDeleteColor);
        }

        this._prevDeleteColor = deleteColor;
        document
          .getElementById("context-menu-delete")
          .addEventListener("click", deleteColor);

        e.preventDefault();
      },
      false
    );

    let [temporaryPalette, temporaryPaletteElement] = [undefined, undefined];
    // DragStart Handler
    el.addEventListener(
      "dragstart",
      async e => {
        e.target.classList.add("dragging");

        // set ghost overlay image
        const elem = document.createElement("div");
        elem.id = "drag-ghost";
        elem.style.position = "absolute";
        elem.style.top = "-1000px";
        elem.style.backgroundColor = "#" + color;
        document.body.appendChild(elem);
        e.dataTransfer.setDragImage(elem, 0, 0);

        // set data transfer type and data
        e.dataTransfer.setData("text/plain", color);
        e.dataTransfer.dropEffect = "copy";

        // Increase size of window to accommodate
        this.changeHistoryWindowBounds(110, -110);
        [
          temporaryPalette,
          temporaryPaletteElement
        ] = this.generateTemporaryPalette();
      },
      false
    );

    // DragEnd Handler
    el.addEventListener(
      "dragend",
      async e => {
        e.target.classList.remove("dragging");
        if (
          temporaryPaletteElement &&
          temporaryPaletteElement.querySelectorAll(".history>ul>li").length > 0
        ) {
          // save palette
          ipcRenderer
            .invoke("PALETTE", {
              type: "SAVE",
              args: temporaryPalette.serialize()
            })
            .catch(err => {
              console.warn(err);
            });
          [temporaryPalette, temporaryPaletteElement] = [undefined, undefined];
        } else {
          this.changeHistoryWindowBounds(-110, 110);
          // remove temp palette
          temporaryPalette.removePalette(temporaryPaletteElement);
          [temporaryPalette, temporaryPaletteElement] = [undefined, undefined];
        }
        // clear generated ghost element
        const dragGhostEl = document.getElementById("drag-ghost");
        dragGhostEl.parentNode.removeChild(dragGhostEl);
      },
      false
    );
  }

  /**
   * Creates a temporary new palette for the user to use when dragging colors
   * @return {[Palette, PaletteElement]}
   */
  generateTemporaryPalette() {
    // Create New Blank Palette
    const p = new Palette({
      colors: [],
      name: "New Color Palette",
      // eslint-disable-next-line security-node/detect-insecure-randomness
      id: Math.random()
        .toString(36)
        .substr(2, 9)
    });
    const newPaletteEl = p.createElement();
    p.appendNewPalette(newPaletteEl);
    return [p, newPaletteEl];
  }

  /**
   * Serialize Palette back to object for storage purposes
   * @return {{name: string, colors: [string], id: string}}
   */
  serialize() {
    return {
      name: this._Name,
      colors: this._Colors,
      id: this._ID
    };
  }
}

module.exports = Palette;
