// setup basic information for plugin
exports.config = () => ({
  name: "java_rgba",
  type: "format",
  format: {
    displayName: "Java RGBA",
    displayFormat: "new Color(int r,int g, int b, int a)",
    icon: "java"
  }
});

// convert the inputted color object format
// into another format and return the final
// string value
exports.convertColor = color => {
  return (
    "new Color(" + color.rgb.r + "," + color.rgb.g + "," + color.rgb.b + ",255)"
  );
};
