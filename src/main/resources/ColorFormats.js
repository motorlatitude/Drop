const glob = require("glob");
const fs = require("fs");
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
          fs.readFile(pluginPath, "utf8", (err, contents) => {
            // eslint rule disabled here, to enable a plugin system 3rd-party code
            // must be allowed to load and run here
            // eslint-disable-next-line security-node/detect-non-literal-require-calls
            const plug = require(pluginPath);
            const plugConfigParams = plug.config();
            if (plugConfigParams.type === "format") {
              this._colorFormats.push({
                title: plugConfigParams.format.displayName,
                sub_title: plugConfigParams.format.displayFormat,
                icon: plugConfigParams.format.icon,
                value: plugConfigParams.name,
                file: contents,
                convertFromHex: hexColor => {
                  const r = parseInt("0x" + hexColor.substring(0, 2));
                  const g = parseInt("0x" + hexColor.substring(2, 4));
                  const b = parseInt("0x" + hexColor.substring(4, 6));
                  return plug.convertColor({
                    hex: hexColor,
                    rgb: {
                      r,
                      g,
                      b
                    }
                  });
                }
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
        });
      }
    });
  }
}

module.exports = ColorFormats;
