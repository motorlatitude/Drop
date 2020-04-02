exports.format = shortcutKeyArray => {
  let keyString = "";
  // converts any special keys to electron's used keys
  const keyName = keyString => {
    switch (keyString) {
      case "Control":
        return "CommandOrControl";
      case "Command":
        return "CommandOrControl";
      case "ArrowUp":
        return "Up";
      case "ArrowDown":
        return "Down";
      case "ArrowLeft":
        return "Left";
      case "ArrowRight":
        return "Right";
      default:
        return keyString;
    }
  };

  for (let i = 0; i < shortcutKeyArray.length; i++) {
    keyString += "" + keyName(shortcutKeyArray[i]) + "+";
  }
  return keyString.substring(0, keyString.length - 1);
};
