const electron = require("electron");
const { BrowserWindow } = electron;

class HistoryWindow {

  constructor() {
    this.window = null;
    this.createWindow();
  }

  createWindow() {
    // Create the browser window.
    const historyWindow = new BrowserWindow({
      x: electron.screen.getPrimaryDisplay().workAreaSize.width - 400,
      y: electron.screen.getPrimaryDisplay().workAreaSize.height - 210,
      width: 390,
      height: 210,
      resizable: false,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      show: false,
      icon: __dirname + './../assets/img/icon.png',
      webPreferences: {
        nodeIntegration: true
      }
    });
    this.window = historyWindow;
    // and load the index.html of the app.
    this.window.loadFile(__dirname + './../history.html');

    // Open the DevTools.
    //historyWindow.webContents.openDevTools({detached: true})

    // Emitted when the window is closed.
    this.window.on('closed', function () {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      this.window = null;
    });
  }

}

module.exports = HistoryWindow;
