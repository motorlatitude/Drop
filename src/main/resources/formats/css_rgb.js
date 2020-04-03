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

// convert the inputted color object format
// into another format and return the final
// string value
exports.convertColor = color => {
  return "rgb(" + color.rgb.r + "," + color.rgb.g + "," + color.rgb.b + ")";
};
