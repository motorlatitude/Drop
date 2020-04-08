// setup basic information for plugin
exports.config = () => ({
  name: "css_rgba",
  type: "format",
  format: {
    displayName: "CSS RGBA",
    displayFormat: "rgba(rrr,ggg,bbb,alpha)",
    icon: "css_2"
  }
});

// convert the inputted color object format
// into another format and return the final
// string value
exports.convertColor = color => {
  return "rgba(" + color.rgb.r + "," + color.rgb.g + "," + color.rgb.b + ",1)";
};
