// setup basic information for plugin
exports.config = () => ({
  name: "css_hsl",
  type: "format",
  format: {
    displayName: "CSS HSL",
    displayFormat: "hsl(hue, sat%, light%)",
    icon: "css_2"
  }
});

// convert the inputted hex color format into another format and return the final string value
exports.convertHexColor = hex_color => {
  let r = parseInt("0x" + hex_color.substring(0, 2));
  let g = parseInt("0x" + hex_color.substring(2, 4));
  let b = parseInt("0x" + hex_color.substring(4, 6));
  //L
  let rp = r / 255;
  let gp = g / 255;
  let bp = b / 255;
  let max_l = Math.max(rp, gp, bp);
  let min_l = Math.min(rp, gp, bp);
  let luminescence = Math.ceil(((max_l + min_l) / 2) * 100);
  let saturation = 0;
  let hue = 0;
  if (max_l !== min_l) {
    //there is saturation
    //S
    if (luminescence < 50) {
      saturation = Math.ceil(((max_l - min_l) / (max_l + min_l)) * 100);
    } else {
      saturation = Math.ceil(((max_l - min_l) / (2 - max_l - min_l)) * 100);
    }
    //H
    let temp_h;
    if (max_l == rp) {
      temp_h = ((gp - bp) / (max_l - min_l)) * 60;
    } else if (max_l == gp) {
      temp_h = (2 + (bp - rp) / (max_l - min_l)) * 60;
    } else if (max_l == bp) {
      temp_h = (4 + (rp - gp) / (max_l - min_l)) * 60;
    }
    if (temp_h < 0) {
      temp_h += 360;
    }
    hue = Math.ceil(temp_h);
  }
  return "hsl(" + hue + "," + saturation + "%," + luminescence + "%)";
};
