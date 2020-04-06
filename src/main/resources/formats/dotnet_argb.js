// setup basic information for plugin
exports.config = () => ({
  name: "dotnet_argb",
  type: "format",
  format: {
    displayName: ".NET ARGB",
    displayFormat: "FromArgb(Int32, Int32, Int32, Int32)",
    icon: "dotnet"
  }
});

// convert the inputted color object format
// into another format and return the final
// string value
exports.convertColor = color => {
  return (
    "Color.FromArgb(255, " +
    color.rgb.r +
    ", " +
    color.rgb.g +
    ", " +
    color.rgb.b +
    ")"
  );
};
