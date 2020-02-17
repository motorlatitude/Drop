const glob = require("glob");
const log = require("electron-log");

/**
 * ColorFormats Class
 *
 * Collates all the different possible formats from the ./formats directory
 */
class ColorFormats {
  /**
   * Creates an instance of ColorFormats.
   * @memberof ColorFormats
   */
  constructor() {
    this._colorFormats = [];
    this._loadFormats();
    this._selectedFormat = "css_hex";
  }

  /**
   * Get available formats
   *
   * @readonly
   * @memberof ColorFormats
   */
  get formats() {
    return this._colorFormats;
  }

  /**
   * Get the currently selected format name
   *
   * @memberof ColorFormats
   */
  get selectedFormat() {
    return this._selectedFormat;
  }

  /**
   * Set the currently selected format name
   * @param {('css_hex' | 'css_hsl' | 'css_hsla' | 'css_rgb' | 'css_rgba' | string)} format the format that should be set to the currently selected format
   * @memberof ColorFormats
   */
  set selectedFormat(format) {
    this._selectedFormat = format;
  }

  /**
   * Load all format plugins from ./formats/*.js directory
   * @memberof ColorFormats
   */
  _loadFormats() {
    glob(__dirname + "/formats/*.js", { nodir: true }, (err, files) => {
      if (err) {
        log.error(err);
      } else {
        log.log("Plugins:", files);
        files.forEach((pluginPath, index) => {
          const plug = require(pluginPath);
          const plugConfigParams = plug.config();
          if (plugConfigParams.type === "format") {
            this._colorFormats.push({
              title: plugConfigParams.format.displayName,
              sub_title: plugConfigParams.format.displayFormat,
              icon: plugConfigParams.format.icon,
              value: plugConfigParams.name,
              convertFromHex: hexColor => plug.convertHexColor(hexColor)
            });
          } else {
            log.error(
              new Error(
                "Plugin has the wrong type, expected type 'format', received '" +
                  plugConfigParams.type +
                  "'"
              )
            );
          }
        });
      }
    });
  }
}

module.exports = ColorFormats;
