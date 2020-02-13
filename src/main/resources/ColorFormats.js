const glob = require("glob");
const log = require("electron-log");
class ColorFormats {
  constructor() {
    this._colorFormats = [];
    this._loadFormats();
    this._selectedFormat = "css_hex";
  }

  get formats() {
    return this._colorFormats;
  }

  get selectedFormat() {
    return this._selectedFormat;
  }

  set selectedFormat(format) {
    this._selectedFormat = format;
  }

  /**
   * Load all format plugins from ./formats/*.js directory
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
              convertFromHex: hex_color => plug.convertHexColor(hex_color)
            });
          } else {
            log.error(
              new Error("Plugin has the wrong type, expected type 'format', received '" + plugConfigParams.type + "'")
            );
          }
        });
      }
    });
  }
}

module.exports = ColorFormats;
