// setup basic information for plugin
exports.config = () => ({
  name: "css_hex",
  type: "format",
  format: {
    displayName: "CSS Hex",
    displayFormat: "#rrggbb",
    icon: "css"
  }
});

// convert the inputted hex color format into another format and return the final string value
exports.convertColor = color => {
  return "#" + color.hex.toUpperCase();
};
