// setup basic information for plugin
exports.config = () => ({
  name: "css_rgb",
  type: "format",
  format: {
    displayName: "CSS RGB",
    displayFormat: "rgb(rrr,ggg,bbb)",
    icon: "css_2"
  }
});

// convert the inputted hex color format into another format and return the final string value
exports.convertHexColor = hexColor => {
  const r = parseInt("0x" + hexColor.substring(0, 2));
  const g = parseInt("0x" + hexColor.substring(2, 4));
  const b = parseInt("0x" + hexColor.substring(4, 6));
  return "rgb(" + r + "," + g + "," + b + ")";
};
