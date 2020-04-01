/**
 * Formats keys to be printed into symbols for display in the settings window
 */
class KeyFormatter {
  /**
   * KeyFormatter constructor
   * @constructor
   */
  constructor() {}

  /**
   * Format the key
   * @param {string} key the name of the key to format
   * @return {string} keyName
   */
  format(key) {
    let keyName = key.toString().toUpperCase();
    switch (key) {
      case "Control":
        keyName = "ctrl";
        break;
      case "Shift":
        keyName =
          '<svg aria-hidden="true" focusable="false" data-prefix="far" data-icon="arrow-alt-up" class="svg-inline--fa fa-arrow-alt-up fa-w-14" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M48.048 304h73.798v128c0 26.51 21.49 48 48 48h108.308c26.51 0 48-21.49 48-48V304h73.789c42.638 0 64.151-51.731 33.941-81.941l-175.943-176c-18.745-18.745-49.137-18.746-67.882 0l-175.952 176C-16.042 252.208 5.325 304 48.048 304zM224 80l176 176H278.154v176H169.846V256H48L224 80z"></path></svg>';
        break;
      case "Alt":
        keyName = "alt";
        break;
      case "Tab":
        keyName = "tab";
        break;
      case "Enter":
        keyName =
          '<svg aria-hidden="true" style="transform: rotate(90deg);" focusable="false" data-prefix="far" data-icon="level-down-alt" class="svg-inline--fa fa-level-down-alt fa-w-10" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path fill="currentColor" d="M296.64 412.326l-96.16 96.16c-4.686 4.687-12.285 4.686-16.97 0L87.354 412.33c-7.536-7.536-2.198-20.484 8.485-20.485l68.161-.002V56H64a11.996 11.996 0 0 1-8.485-3.515l-32-32C15.955 12.926 21.309 0 32 0h164c13.255 0 24 10.745 24 24v367.842l68.154-.001c10.626-.001 16.066 12.905 8.486 20.485z"></path></svg>';
        break;
      case " ":
        keyName =
          '<svg aria-hidden="true" focusable="false" data-prefix="far" data-icon="window-minimize" class="svg-inline--fa fa-window-minimize fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M480 480H32c-17.7 0-32-14.3-32-32s14.3-32 32-32h448c17.7 0 32 14.3 32 32s-14.3 32-32 32z"></path></svg>';
        break;
      case "ArrowUp" || "Up":
        keyName =
          '<svg aria-hidden="true" focusable="false" data-prefix="far" data-icon="long-arrow-up" class="svg-inline--fa fa-long-arrow-up fa-w-10" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path fill="currentColor" d="M19.716 184.485l19.626 19.626c4.753 4.753 12.484 4.675 17.14-.173L134 123.22V468c0 6.627 5.373 12 12 12h28c6.627 0 12-5.373 12-12V123.22l77.518 80.717c4.656 4.849 12.387 4.927 17.14.173l19.626-19.626c4.686-4.686 4.686-12.284 0-16.971L168.485 35.716c-4.686-4.686-12.284-4.686-16.971 0L19.716 167.515c-4.686 4.686-4.686 12.284 0 16.97z"></path></svg>';
        break;
      case "ArrowDown" || "Down":
        keyName =
          '<svg aria-hidden="true" focusable="false" data-prefix="far" data-icon="long-arrow-down" class="svg-inline--fa fa-long-arrow-down fa-w-10" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path fill="currentColor" d="M300.3 327.5l-19.6-19.6c-4.8-4.8-12.5-4.7-17.1.2L186 388.8V44c0-6.6-5.4-12-12-12h-28c-6.6 0-12 5.4-12 12v344.8l-77.5-80.7c-4.7-4.8-12.4-4.9-17.1-.2l-19.6 19.6c-4.7 4.7-4.7 12.3 0 17l131.8 131.8c4.7 4.7 12.3 4.7 17 0l131.8-131.8c4.6-4.7 4.6-12.3-.1-17z"></path></svg>';
        break;
      case "ArrowRight" || "Right":
        keyName =
          '<svg aria-hidden="true" focusable="false" data-prefix="far" data-icon="long-arrow-right" class="svg-inline--fa fa-long-arrow-right fa-w-14" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M295.515 115.716l-19.626 19.626c-4.753 4.753-4.675 12.484.173 17.14L356.78 230H12c-6.627 0-12 5.373-12 12v28c0 6.627 5.373 12 12 12h344.78l-80.717 77.518c-4.849 4.656-4.927 12.387-.173 17.14l19.626 19.626c4.686 4.686 12.284 4.686 16.971 0l131.799-131.799c4.686-4.686 4.686-12.284 0-16.971L312.485 115.716c-4.686-4.686-12.284-4.686-16.97 0z"></path></svg>';
        break;
      case "ArrowLeft" || "Left":
        keyName =
          '<svg aria-hidden="true" focusable="false" data-prefix="far" data-icon="long-arrow-left" class="svg-inline--fa fa-long-arrow-left fa-w-14" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M152.485 396.284l19.626-19.626c4.753-4.753 4.675-12.484-.173-17.14L91.22 282H436c6.627 0 12-5.373 12-12v-28c0-6.627-5.373-12-12-12H91.22l80.717-77.518c4.849-4.656 4.927-12.387.173-17.14l-19.626-19.626c-4.686-4.686-12.284-4.686-16.971 0L3.716 247.515c-4.686 4.686-4.686 12.284 0 16.971l131.799 131.799c4.686 4.685 12.284 4.685 16.97-.001z"></path></svg>';
        break;
      default:
        break;
    }
    return keyName;
  }
}

module.exports = KeyFormatter;
