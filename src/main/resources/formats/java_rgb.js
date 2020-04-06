// setup basic information for plugin
exports.config = () => ({
  name: "java_rgb",
  type: "format",
  format: {
    displayName: "Java RGB",
    displayFormat: "new Color(int r,int g, int b)",
    icon: "java"
  }
});

// convert the inputted color object format
// into another format and return the final
// string value
exports.convertColor = color => {
  return (
    "new Color(" + color.rgb.r + "," + color.rgb.g + "," + color.rgb.b + ")"
  );
};
