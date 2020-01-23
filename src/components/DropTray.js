const { Menu, Tray } = require('electron');

/**
 * DropTray Class
 * In charge of handling the functions of the tray icon
 */
class DropTray {

  constructor(mw, hw) {
    this.tray = null;
    this.mainWindow = mw;
    this.historyWindow = hw;
    this.createNewTray();
  }

  setTrayImage(img) {
    this.tray.setImage(img);
  }

  createNewTray() {
    this.tray = new Tray(__dirname + './../assets/img/taskbar_icon.png');

    const contextMenu = Menu.buildFromTemplate([
      { label: 'Picker', type: 'normal', click: () => {
        if(this.mainWindow){
          if(this.mainWindow.isVisible()){
            this.mainWindow.hide();
          } else {
            this.mainWindow.show();
          }
        }
      } },
      { label: 'History', type: 'normal', click: () => {
        if(this.historyWindow){
          if(this.historyWindow.isVisible()){
            this.historyWindow.hide();
          }else{
            this.historyWindow.show();
          }
        }
      } },
      { type: 'separator'},
      { label: 'Settings', type: 'normal' },
      { type: 'separator'},
      { label: 'Quit', type: 'normal', role: 'quit'}
    ]);
    this.tray.setToolTip('Drop');
    this.tray.setContextMenu(contextMenu);

    this.tray.on("click", () => {
      if(this.historyWindow){
        if(this.historyWindow.isVisible()){
          this.historyWindow.hide();
        }else{
          this.historyWindow.show();
        }
      }
    });
  }

}

module.exports = DropTray;
