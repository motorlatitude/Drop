class ColorFormats {
  constructor() {
    this._colorFormats = [
      {
        title: "CSS Hex",
        sub_title: "#rrggbb",
        icon: "css",
        value: "css_hex"
      },
      {
        title: "CSS HSL",
        sub_title: "hsl(hue, sat%, light%)",
        icon: "css_2",
        value: "css_hsl"
      },
      {
        title: "CSS HSLA",
        sub_title: "hsl(hue, sat%, light%, alpha)",
        icon: "css_2",
        value: "css_hsla"
      },
      {
        title: "CSS RGB",
        sub_title: "rgb(rrr,ggg,bbb)",
        icon: "css_2",
        value: "css_rgb"
      },
      {
        title: "CSS RGBA",
        sub_title: "rgb(rrr,ggg,bbb,alpha)",
        icon: "css_2",
        value: "css_rgba"
      }
    ];
    this._selectedFormat = "css_hex";
  }

  get formats() {
    return this._colorFormats;
  }

  set formats(f) {
    this._colorFormats = f;
  }

  get selectedFormat() {
    return this._selectedFormat;
  }

  set selectedFormat(format) {
    this._selectedFormat = format;
  }
}

module.exports = ColorFormats;
