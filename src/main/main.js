const electron = require("electron");
const { app, ipcMain, clipboard, globalShortcut, nativeImage } = electron;
const robot = require("robotjs"); // => /!\ when installing robotjs add --target={electron version} flag
const svg2png = require("svg2png");
const log = require("electron-log");

const DropTray = require("./DropTray");
const HistoryWindowController = require("./windows/HistoryWindowController");
const PickerWindowController = require("./windows/PickerWindowController");

const WindowManager = require("./windows/WindowManager");
const MessageHandler = require("./ipc/MessageHandler");
const ColorFormats = require("./resources/ColorFormats");
const Updater = require("./resources/Updater");

const Store = require("electron-store");
const store = new Store();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let windowBoss, mainWindow, historyWindow, mainWindowController, updater;
let mouseInterval;
let color_format = "css_hex";
let picker_size = 17;
let zoom_factor = 1;

let tray = null;

app.commandLine.appendSwitch("force-color-profile", "srgb"); //TODO: further research into this for selecting color profile for app, possible option in settings for different types

let colorFormats = new ColorFormats();

function createWindow() {
  windowBoss = new WindowManager();
  updater = new Updater(store, windowBoss);
  const p = new PickerWindowController(windowBoss);
  mainWindowController = p;
  mainWindow = windowBoss.windows.picker;

  // Register a 'CommandOrControl+X' shortcut listener.
  const ret = globalShortcut.register("CommandOrControl+I", () => {
    log.log("Global shortcut to show picker was pressed");
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.webContents.zoomFactor = 1;
      }
    }
  });

  if (!ret) {
    log.error(new Error("Failed to register new global shortcut"));
  }

  // Check whether a shortcut is registered.
  log.info("Global shortcut is registered: ", globalShortcut.isRegistered("CommandOrControl+I"));

  let previous_mouse_position = { x: 0, y: 0 };
  // Get mouse position.
  mouseInterval = setInterval(() => {
    if (!windowBoss.isQuitting && windowBoss.windows.picker && mainWindowController.isVisible) {
      var mouse = robot.getMousePos();
      if (previous_mouse_position.x != mouse.x || previous_mouse_position.y != mouse.y) {
        previous_mouse_position.x = mouse.x;
        previous_mouse_position.y = mouse.y;
        let size = picker_size;
        var img = robot.screen.capture(Math.ceil(mouse.x - size / 2), Math.ceil(mouse.y - size / 2), size, size);
        let multi = img.width / size;
        let currentScreen = electron.screen.getDisplayNearestPoint({
          x: mouse.x,
          y: mouse.y
        });
        let factor = currentScreen.scaleFactor;
        let workAreaSize = currentScreen.workArea;
        let windowX = Math.floor(mouse.x / factor) - 20;
        let windowY = Math.floor(mouse.y / factor) - 20;
        if (workAreaSize.width < mouse.x / factor - workAreaSize.x + picker_size * 15) {
          windowX = Math.floor(mouse.x / factor) - (picker_size * 15 - 20);
        }
        if (workAreaSize.height < mouse.y / factor - workAreaSize.y + (picker_size * 15 - 90)) {
          windowY = Math.floor(mouse.y / factor) - (picker_size * 15 - 20);
        }
        mainWindow.setBounds(
          {
            x: windowX,
            y: windowY,
            width: picker_size * 15,
            height: picker_size * 15
          },
          false
        );
        let colors = {};
        for (var k = 0; k < size; k++) {
          colors[k] = [];
          for (var l = 0; l < size; l++) {
            var hex = img.colorAt(l * multi, k * multi);
            colors[k].push({
              x: 6 + k,
              y: 6 + l,
              color: hex
            });
          }
        }
        mainWindow.webContents.send("color", JSON.stringify(colors));
      }
    }
  }, 16);

  ipcMain.on("clicked", function(event, arg) {
    let historyStore = store.get("history", []);
    color_format = colorFormats.selectedFormat;
    log.info(color_format);
    if (historyStore.length > 30) {
      historyStore.shift();
    }
    historyStore.push(arg.toUpperCase());
    store.set("history", historyStore);
    const icon_SVG =
      '<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 726.58 877"><defs><style>.cls-1{fill:none;stroke:#fff;stroke-miterlimit:10;stroke-width:30px;}.cls-2{fill:#' +
      arg.toUpperCase() +
      ';}</style></defs><title>taskbar_icon</title><path class="cls-1" d="M1194,341.71q3.73,3.65,7.38,7.38a348.29,348.29,0,1,1-499.88,0c2.42-2.49,4.89-4.95,7.38-7.38" transform="translate(-588.1 -77.94)"/><polyline class="cls-1" points="113.35 271.15 120.72 263.78 363.29 21.21 605.85 263.78 613.23 271.15"/><path class="cls-2" d="M674.58,582.8c72.54-48.36,90.37-59,146.36-52,64.49,8.06,120.91,120.91,241.82,120.91,119,0,146.36-60.82,162.48-76.94h0C1225.24,727.5,1102.66,855,949.9,855S674.58,735.56,674.58,582.8Z" transform="translate(-588.1 -77.94)"/></svg>';
    svg2png(Buffer.from(icon_SVG), { width: 512 })
      .then(image => {
        tray.setTrayImage(nativeImage.createFromBuffer(image));
      })
      .catch(err => {
        log.error(err);
      });

    if (color_format == "css_hex") {
      log.log("Selected Color: #" + arg.toUpperCase());
      clipboard.writeText("#" + arg.toUpperCase());
      historyWindow.window.webContents.send("color_history", "#" + arg.toUpperCase());
    } else if (color_format == "css_rgba") {
      let r = parseInt("0x" + arg.substring(0, 2));
      let g = parseInt("0x" + arg.substring(2, 4));
      let b = parseInt("0x" + arg.substring(4, 6));
      let color = "rgba(" + r + "," + g + "," + b + ",1)";
      log.log("Selected Color: " + color);
      clipboard.writeText(color);
      historyWindow.window.webContents.send("color_history", "#" + arg.toUpperCase());
    } else if (color_format == "css_rgb") {
      let r = parseInt("0x" + arg.substring(0, 2));
      let g = parseInt("0x" + arg.substring(2, 4));
      let b = parseInt("0x" + arg.substring(4, 6));
      let color = "rgb(" + r + "," + g + "," + b + ")";
      log.log("Selected Color: " + color);
      clipboard.writeText(color);
      historyWindow.window.webContents.send("color_history", "#" + arg.toUpperCase());
    } else if (color_format == "css_hsl") {
      let r = parseInt("0x" + arg.substring(0, 2));
      let g = parseInt("0x" + arg.substring(2, 4));
      let b = parseInt("0x" + arg.substring(4, 6));
      //L
      let rp = r / 255;
      let gp = g / 255;
      let bp = b / 255;
      let max_l = Math.max(rp, gp, bp);
      let min_l = Math.min(rp, gp, bp);
      let luminesence = Math.ceil(((max_l + min_l) / 2) * 100);
      let saturation = 0;
      let hue = 0;
      if (max_l !== min_l) {
        //there is saturation
        //S
        if (luminesence < 50) {
          saturation = Math.ceil(((max_l - min_l) / (max_l + min_l)) * 100);
        } else {
          saturation = Math.ceil(((max_l - min_l) / (2 - max_l - min_l)) * 100);
        }
        //H
        let temp_h;
        if (max_l == rp) {
          temp_h = ((gp - bp) / (max_l - min_l)) * 60;
        } else if (max_l == gp) {
          temp_h = (2 + (bp - rp) / (max_l - min_l)) * 60;
        } else if (max_l == bp) {
          temp_h = (4 + (rp - gp) / (max_l - min_l)) * 60;
        }
        if (temp_h < 0) {
          temp_h += 360;
        }
        hue = Math.ceil(temp_h);
      }
      let color = "hsl(" + hue + "," + saturation + "%," + luminesence + "%)";
      log.log("Selected Color: " + color);
      clipboard.writeText(color);
      historyWindow.window.webContents.send("color_history", "#" + arg.toUpperCase());
    } else if (color_format == "css_hsla") {
      let r = parseInt("0x" + arg.substring(0, 2));
      let g = parseInt("0x" + arg.substring(2, 4));
      let b = parseInt("0x" + arg.substring(4, 6));
      //L
      let rp = r / 255;
      let gp = g / 255;
      let bp = b / 255;
      let max_l = Math.max(rp, gp, bp);
      let min_l = Math.min(rp, gp, bp);
      let luminesence = Math.ceil(((max_l + min_l) / 2) * 100);
      let saturation = 0;
      let hue = 0;
      if (max_l !== min_l) {
        //S
        if (luminesence < 50) {
          saturation = Math.ceil(((max_l - min_l) / (max_l + min_l)) * 100);
        } else {
          saturation = Math.ceil(((max_l - min_l) / (2 - max_l - min_l)) * 100);
        }
        //H
        let temp_h;
        if (max_l == rp) {
          temp_h = ((gp - bp) / (max_l - min_l)) * 60;
        } else if (max_l == gp) {
          temp_h = (2 + (bp - rp) / (max_l - min_l)) * 60;
        } else if (max_l == bp) {
          temp_h = (4 + (rp - gp) / (max_l - min_l)) * 60;
        }
        if (temp_h < 0) {
          temp_h += 360;
        }
        hue = Math.ceil(temp_h);
      }
      let color = "hsla(" + hue + "," + saturation + "%," + luminesence + "%,1)";
      log.log("Selected Color: " + color);
      clipboard.writeText(color);
      historyWindow.window.webContents.send("color_history", "#" + arg.toUpperCase());
    } else {
      log.log("Selected Color: #" + arg.toUpperCase());
      clipboard.writeText("#" + arg.toUpperCase());
      historyWindow.window.webContents.send("color_history", "#" + arg.toUpperCase());
    }
    setTimeout(function() {
      mainWindow.hide();
    }, 250);
  });

  ipcMain.on("esc", function(event, arg) {
    log.info("User pressed ESC to hide picker window");
    mainWindow.hide();
  });

  ipcMain.on("color-type-change", function(event, arg) {
    //color format type changed
    log.info("Changing Color Format To", arg);
    color_format = arg.type;
    historyWindow.window.webContents.send("color-type-change", arg);
  });

  //move cursor
  ipcMain.on("move-right", function(event, arg) {
    let mouse = robot.getMousePos();
    if (arg == "shift") {
      robot.moveMouse(mouse.x + 10, mouse.y);
    } else {
      robot.moveMouse(mouse.x + 1, mouse.y);
    }
  });

  ipcMain.on("move-left", function(event, arg) {
    let mouse = robot.getMousePos();
    if (arg == "shift") {
      robot.moveMouse(mouse.x - 10, mouse.y);
    } else {
      robot.moveMouse(mouse.x - 1, mouse.y);
    }
  });

  ipcMain.on("move-up", function(event, arg) {
    let mouse = robot.getMousePos();
    if (arg == "shift") {
      robot.moveMouse(mouse.x, mouse.y - 10);
    } else {
      robot.moveMouse(mouse.x, mouse.y - 1);
    }
  });

  ipcMain.on("move-down", function(event, arg) {
    let mouse = robot.getMousePos();
    if (arg == "shift") {
      robot.moveMouse(mouse.x, mouse.y + 10);
    } else {
      robot.moveMouse(mouse.x, mouse.y + 1);
    }
  });

  ipcMain.on("loop-size", function(event, arg) {
    if (arg == "picker-increase") {
      //enlarge picker size
      if (picker_size <= 27) {
        picker_size += 5;
        mainWindow.setBounds({ width: picker_size * 15, height: picker_size * 15 }, false);
      }
    } else if (arg == "picker-decrease") {
      //decrease picker size
      if (picker_size >= 12) {
        picker_size -= 5;
        mainWindow.setBounds({ width: picker_size * 15, height: picker_size * 15 }, false);
      }
    } else if (arg == "zoom-increase") {
      //increase zoom size
    } else {
      //decrease loop size
    }
  });

  ipcMain.on("show-loop", function() {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
      }
    }
  });

  historyWindow = new HistoryWindowController(windowBoss);
  tray = new DropTray(mainWindow, historyWindow.window);

  let messageHandler = new MessageHandler(windowBoss, store, tray, colorFormats, updater);
  messageHandler.setupListeners();
}

app.setLoginItemSettings({
  openAtLogin: true
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

app.on("will-quit", () => {
  mainWindow = null;
  globalShortcut.unregisterAll();
});

app.on("before-quit", () => {
  log.info("Cleanup Before Quitting");
  clearInterval(mouseInterval);
  windowBoss.isQuitting = true;
  log.info("Removing Close Event Listeners From Windows");
  Object.keys(windowBoss.windows).forEach((windowName, index) => {
    windowBoss.windows[windowName].removeAllListeners("close");
    windowBoss.windows[windowName].close();
  });
});

// Quit when all windows are closed.
app.on("window-all-closed", function() {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", function() {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
