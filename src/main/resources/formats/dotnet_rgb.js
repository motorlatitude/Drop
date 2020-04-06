// setup basic information for plugin
exports.config = () => ({
  name: "dotnet_rgb",
  type: "format",
  format: {
    displayName: ".NET RGB",
    displayFormat: "FromArgb(Int32, Int32, Int32)",
    icon: "dotnet"
  }
});

// convert the inputted color object format
// into another format and return the final
// string value
exports.convertColor = color => {
  return (
    "Color.FromArgb(" +
    color.rgb.r +
    ", " +
    color.rgb.g +
    ", " +
    color.rgb.b +
    ")"
  );
};
