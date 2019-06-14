// Modules to control application life and create native browser window
const electron = require('electron');
const {app, BrowserWindow, ipcMain, clipboard, globalShortcut} = electron
const robot = require('./robotjs/index')
const fs = require('fs');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let historyWindow
let color_format = "css_hex";
let picker_size = 17;
let zoom_factor = 1;

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: picker_size*15,
    height: picker_size*15,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    show: false,
    webPreferences: {
      nodeIntegration: true
    }
  })
  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  //mainWindow.webContents.openDevTools({detached: true})

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

  // Register a 'CommandOrControl+X' shortcut listener.
  const ret = globalShortcut.register('CommandOrControl+I', () => {
    console.log('CommandOrControl+I is pressed');
    if(mainWindow.isVisible()){
      mainWindow.hide();
    }else{
      mainWindow.show();
    }
  })

  if (!ret) {
    console.log('registration failed')
  }

  // Check whether a shortcut is registered.
  console.log(globalShortcut.isRegistered('CommandOrControl+I'))

  let previous_mouse_position = {x: 0, y: 0}
  // Get mouse position.
  setInterval(() => {
    if(mainWindow.isVisible()){
      var mouse = robot.getMousePos();
      if(previous_mouse_position.x != mouse.x || previous_mouse_position.y != mouse.y){
        previous_mouse_position.x = mouse.x;
        previous_mouse_position.y = mouse.y;
        let size = picker_size;
        var img = robot.screen.capture(Math.ceil(mouse.x - (size/2)), Math.ceil(mouse.y - (size/2)), size, size);
        let multi = img.width / size;
        let currentScreen = electron.screen.getDisplayNearestPoint({x: mouse.x, y: mouse.y})
        let factor = currentScreen.scaleFactor;
        let workAreaSize = currentScreen.workArea;
        let windowX = Math.floor(mouse.x / factor) - 20;
        let windowY = Math.floor(mouse.y / factor) - 20;
        if(workAreaSize.width < ((mouse.x / factor) - workAreaSize.x + (picker_size*15))){
          windowX = Math.floor(mouse.x / factor) - ((picker_size*15) - 20)
        }
        if(workAreaSize.height < ((mouse.y / factor) - workAreaSize.y + ((picker_size*15) - 90))){
          windowY = Math.floor(mouse.y / factor) - ((picker_size*15) - 20)
        }
        mainWindow.setBounds({x: windowX, y: windowY, width: (picker_size*15), height: (picker_size*15)}, false);
        let colors = {};
        for(var k=0;k < size;k++){
          colors[k] = [];
          for(var l=0;l < size; l++){
            var hex = img.colorAt(l * multi, k * multi);
            colors[k].push({
              x: 6 + k,
              y: 6 + l,
              color: hex
            })
          }
        }
        mainWindow.webContents.send("color", JSON.stringify(colors))
      }
    }
  }, 0);

  ipcMain.on("clicked", function(event, arg){
    if(color_format == "css_hex"){
      console.log("Selected Color: #"+arg.toUpperCase());
      clipboard.writeText('#'+arg.toUpperCase());
      historyWindow.webContents.send("color_history", '#'+arg.toUpperCase())
    }
    else if(color_format == "css_rgba"){
      let r = parseInt("0x"+arg.substring(0,2));
      let g = parseInt("0x"+arg.substring(2,4));
      let b = parseInt("0x"+arg.substring(4,6));
      let color = "rgba("+r+","+g+","+b+",1)";
      console.log("Selected Color: "+color);
      clipboard.writeText(color);
      historyWindow.webContents.send("color_history", '#'+arg.toUpperCase())
    }
    else if(color_format == "css_rgb"){
      let r = parseInt("0x"+arg.substring(0,2));
      let g = parseInt("0x"+arg.substring(2,4));
      let b = parseInt("0x"+arg.substring(4,6));
      let color = "rgb("+r+","+g+","+b+")";
      console.log("Selected Color: "+color);
      clipboard.writeText(color);
      historyWindow.webContents.send("color_history", '#'+arg.toUpperCase())
    }
    else if(color_format == "css_hsl"){
      let r = parseInt("0x"+arg.substring(0,2));
      let g = parseInt("0x"+arg.substring(2,4));
      let b = parseInt("0x"+arg.substring(4,6));
      //L
      let rp = r / 255;
      let gp = g / 255;
      let bp = b / 255;
      let max_l = Math.max(rp, gp, bp);
      let min_l = Math.min(rp, gp, bp);
      let luminesence = Math.ceil(((max_l + min_l) / 2)*100);
      let saturation = 0;
      let hue = 0;
      if(max_l !== min_l){
        //there is saturation
        //S
        if(luminesence < 50){
          saturation = Math.ceil(((max_l - min_l)/(max_l + min_l))*100)
        }
        else{
          saturation = Math.ceil(((max_l - min_l)/(2 - max_l - min_l))*100)
        }
        //H
        let temp_h;
        if(max_l == rp){
          temp_h = ((gp - bp)/(max_l - min_l))*60;
        }
        else if(max_l == gp){
          temp_h = (2+((bp - rp)/(max_l - min_l)))*60;
        }
        else if(max_l == bp){
          temp_h = (4+((rp - gp)/(max_l - min_l)))*60;
        }
        if(temp_h < 0){
          temp_h += 360
        }
        hue = Math.ceil(temp_h);
      }
      let color = "hsl("+hue+","+saturation+","+luminesence+")";
      console.log("Selected Color: "+color);
      clipboard.writeText(color);
      historyWindow.webContents.send("color_history", '#'+arg.toUpperCase())
    }
    else if(color_format == "css_hsla"){
      let r = parseInt("0x"+arg.substring(0,2));
      let g = parseInt("0x"+arg.substring(2,4));
      let b = parseInt("0x"+arg.substring(4,6));
      //L
      let rp = r / 255;
      let gp = g / 255;
      let bp = b / 255;
      let max_l = Math.max(rp, gp, bp);
      let min_l = Math.min(rp, gp, bp);
      let luminesence = Math.ceil(((max_l + min_l) / 2)*100);
      let saturation = 0;
      let hue = 0;
      if(max_l !== min_l){
        //S
        if(luminesence < 50){
          saturation = Math.ceil(((max_l - min_l)/(max_l + min_l))*100)
        }
        else{
          saturation = Math.ceil(((max_l - min_l)/(2 - max_l - min_l))*100)
        }
        //H
        let temp_h;
        if(max_l == rp){
          temp_h = (((gp - bp)/(max_l - min_l))*60);
        }
        else if(max_l == gp){
          temp_h = (2+((bp - rp)/(max_l - min_l)))*60;
        }
        else if(max_l == bp){
          temp_h = (4+((rp - gp)/(max_l - min_l)))*60;
        }
        if(temp_h < 0){
          temp_h += 360
        }
        hue = Math.ceil(temp_h);
      }
      let color = "hsla("+hue+","+saturation+","+luminesence+",1)";
      console.log("Selected Color: "+color);
      clipboard.writeText(color);
      historyWindow.webContents.send("color_history", '#'+arg.toUpperCase())
    }
    else{
      console.log("Selected Color: #"+arg.toUpperCase());
      clipboard.writeText('#'+arg.toUpperCase());
      historyWindow.webContents.send("color_history", '#'+arg.toUpperCase())
    }
    setTimeout(function(){
      mainWindow.hide();
    }, 250);
  }); 

  ipcMain.on("esc", function(event, arg){
    console.log("User Escaped");
    mainWindow.hide();
  });

  ipcMain.on("color-type-change", function(event, arg){
    //color format type changed
    console.log("color-type-change: ", arg);
    color_format = arg.type
    historyWindow.webContents.send("color-type-change", arg)
  });

  //move cursor
  ipcMain.on("move-right", function(event, arg){
    let mouse = robot.getMousePos();
    if(arg == "shift"){
      robot.moveMouse(mouse.x+10, mouse.y);
    }
    else{
      robot.moveMouse(mouse.x+1, mouse.y);
    }
  });

  ipcMain.on("move-left", function(event, arg){
    let mouse = robot.getMousePos();
    if(arg == "shift"){
      robot.moveMouse(mouse.x-10, mouse.y);
    }
    else{
      robot.moveMouse(mouse.x-1, mouse.y);
    }
  });

  ipcMain.on("move-up", function(event, arg){
    let mouse = robot.getMousePos();
    if(arg == "shift"){
      robot.moveMouse(mouse.x, mouse.y-10);
    }
    else{
      robot.moveMouse(mouse.x, mouse.y-1);
    }
  });

  ipcMain.on("move-down", function(event, arg){
    let mouse = robot.getMousePos();
    if(arg == "shift"){
      robot.moveMouse(mouse.x, mouse.y+10);
    }
    else{
      robot.moveMouse(mouse.x, mouse.y+1);
    }
  });

  ipcMain.on("loop-size", function(event, arg){
    if(arg == "picker-increase"){
      //enlarge picker size
      if(picker_size <= 27){
        picker_size += 5;
        mainWindow.setBounds({width: (picker_size*15), height: (picker_size*15)}, false);
      }
    }
    else if(arg == "picker-decrease"){
      //decrease picker size
      if(picker_size >= 12){
        picker_size -= 5;
        mainWindow.setBounds({width: (picker_size*15), height: (picker_size*15)}, false);
      }

    }
    else if(arg == "zoom-increase"){
      //increase zoom size

    }
    else{
      //decrease loop size
    }
  });

  // Create the browser window.
  historyWindow = new BrowserWindow({
    x: electron.screen.getPrimaryDisplay().workAreaSize.width - 400,
    y: electron.screen.getPrimaryDisplay().workAreaSize.height - 200,
    width: 390,
    height: 190,
    resizable: false,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true
    }
  })
  // and load the index.html of the app.
  historyWindow.loadFile('history.html')

  // Open the DevTools.
  //historyWindow.webContents.openDevTools({detached: true})

  // Emitted when the window is closed.
  historyWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    historyWindow = null
  })

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
