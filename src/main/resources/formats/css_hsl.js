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
exports.convertHexColor = hexColor => {
  const r = parseInt("0x" + hexColor.substring(0, 2));
  const g = parseInt("0x" + hexColor.substring(2, 4));
  const b = parseInt("0x" + hexColor.substring(4, 6));
  // L
  const rp = r / 255;
  const gp = g / 255;
  const bp = b / 255;
  const maxL = Math.max(rp, gp, bp);
  const minL = Math.min(rp, gp, bp);
  const luminescence = Math.ceil(((maxL + minL) / 2) * 100);
  let saturation = 0;
  let hue = 0;
  if (maxL !== minL) {
    // there is saturation
    // S
    if (luminescence < 50) {
      saturation = Math.ceil(((maxL - minL) / (maxL + minL)) * 100);
    } else {
      saturation = Math.ceil(((maxL - minL) / (2 - maxL - minL)) * 100);
    }
    // H
    let tempH;
    if (maxL == rp) {
      tempH = ((gp - bp) / (maxL - minL)) * 60;
    } else if (maxL == gp) {
      tempH = (2 + (bp - rp) / (maxL - minL)) * 60;
    } else if (maxL == bp) {
      tempH = (4 + (rp - gp) / (maxL - minL)) * 60;
    }
    if (tempH < 0) {
      tempH += 360;
    }
    hue = Math.ceil(tempH);
  }
  return "hsl(" + hue + "," + saturation + "%," + luminescence + "%)";
};
