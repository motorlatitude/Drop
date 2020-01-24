const {ipcRenderer, remote} = require('electron');

let colorTypeWindowVisibleState = false;

document.querySelectorAll("#palettes>li").forEach((palette) => {
    console.log(palette);
    palette.querySelector(".options").addEventListener("mouseover", (evt) => {
        palette.querySelector(".options>.expanded-options").classList.add("display");
    })
    palette.querySelector(".options").addEventListener("mouseout", (evt) => {
        palette.querySelector(".options>.expanded-options").classList.remove("display");
    })
});

ipcRenderer.on("get-history-response", function(event, color_history) {
    let elHistoryList = document.getElementById("history-list");
    for(let i=0;i<color_history.length;i++){
        const color = color_history[i];
        let elColorHistory = document.createElement("li");
        elColorHistory.setAttribute("style","background: #"+color+";");
        elColorHistory.setAttribute("draggable","true");
        elColorHistory.addEventListener("click", function(e){
            ipcRenderer.send("clicked", color);
            elHistoryList.removeChild(elColorHistory);
        });
        let currentTempPaletteName = "";
        elColorHistory.addEventListener("dragstart", function(e) {
            console.log("Starting Drag");
            e.target.classList.add("dragging");

            // set ghost overlay image
            var elem = document.createElement("div");
            elem.id = "drag-ghost";
            elem.style.position = "absolute";
            elem.style.top = "-1000px";
            elem.style.backgroundColor = "#"+color;
            document.body.appendChild(elem);
            e.dataTransfer.setDragImage(elem, 0, 0);

            // set data transfer
            e.dataTransfer.setData("text/plain", color);
            e.dataTransfer.dropEffect = "copy";

            // create new temp palette incase user wants to create a new palette with the currently
            // dragged color
            const currentWindowBounds = remote.getCurrentWindow().getBounds();
            remote.getCurrentWindow().setBounds({
                height: currentWindowBounds.height + 110,
                y: currentWindowBounds.y - 110
            }, true);
            const tempPaletteName = "palette-"+Math.round(Math.random()*10000);
            currentTempPaletteName = tempPaletteName;
            const templatePalette = document.getElementById("template-palette").cloneNode(true);
            templatePalette.id = tempPaletteName;
            templatePalette.querySelector(".title>.name").innerHTML = tempPaletteName;
            templatePalette.querySelector(".history").innerHTML = "<ul></ul>";
            templatePalette.querySelector(".history>ul").addEventListener("drop", (e) => {
                e.preventDefault();
                const color = e.dataTransfer.getData('text');
                const elColorItem = document.createElement("li");
                elColorItem.setAttribute("style","background: #"+color+";");
                elColorItem.setAttribute("draggable","true");
                elColorItem.addEventListener("click", function(e){
                    ipcRenderer.send("clicked", color);
                });
                templatePalette.querySelector(".history>ul").appendChild(elColorItem)
            });
            templatePalette.querySelector(".history>ul").addEventListener("dragover", (e) => {
                e.preventDefault();
            });
            document.getElementById("palettes").appendChild(templatePalette);

        }, false);
        elColorHistory.addEventListener("dragend", function(e) {
            console.log("Ending Drag");
            e.target.classList.remove("dragging");
            if (currentTempPaletteName !== "" && document.getElementById(currentTempPaletteName) && document.querySelectorAll("#"+currentTempPaletteName+">.history>ul>li").length > 0) {
                currentTempPaletteName = "";
            } else {
                const currentWindowBounds = remote.getCurrentWindow().getBounds();
                remote.getCurrentWindow().setBounds({
                    height: currentWindowBounds.height - 110,
                    y: currentWindowBounds.y + 110
                }, true);
                // remove temp palette
                const tempPaletteEl = document.getElementById(currentTempPaletteName);
                tempPaletteEl.parentNode.removeChild(tempPaletteEl);
            }
            const dragGhostEl = document.getElementById("drag-ghost");
            dragGhostEl.parentNode.removeChild(dragGhostEl);

        }, false);
        elHistoryList.childNodes[0].after(elColorHistory);
    }
})

ipcRenderer.send("get-history");

let colorTypesWindow = new remote.BrowserWindow({
    parent: remote.getCurrentWindow(),
    show: false,
    resizable: false,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    webPreferences: {
        nodeIntegration: true
    }
});
colorTypesWindow.setAlwaysOnTop(true);

// fix for flashing on windows 10: electron issue #12130
colorTypesWindow.on('show', () => {
    setTimeout(() => {
        colorTypesWindow.setOpacity(1);
    }, 200);
});

colorTypesWindow.on('hide', () => {
    colorTypesWindow.setOpacity(0);
    colorTypeWindowVisibleState = false;
    document.getElementById("select").classList.remove("active");
});

colorTypesWindow.loadURL('file://' + __dirname + '/../color_types.html');

colorTypesWindow.on('blur', () => {
    colorTypesWindow.hide();
    document.getElementById("select").classList.remove("active");
    setTimeout(() => {
        colorTypeWindowVisibleState = false;
    },500);
});

ipcRenderer.on("color_history", function(event, color){
    let elHistoryList = document.getElementById("history-list");
    let elColorHistory = document.createElement("li");
    elColorHistory.setAttribute("style","background: "+color+";");
    elColorHistory.addEventListener("click", function(e){
        ipcRenderer.send("clicked", color.replace("#",""));
        elHistoryList.removeChild(elColorHistory);
    });
    elHistoryList.childNodes[0].after(elColorHistory);
});

ipcRenderer.on("color-type-change", (e, arg) => {
    document.querySelector("#select .name").innerHTML = arg.name;
    document.querySelector("#select .icon").className = "icon "+arg.icon
});

document.querySelector(".picker-button").addEventListener("click", function() {
    ipcRenderer.send("show-loop");
})

document.querySelector(".window-options").addEventListener("click", function(){
    var window = remote.getCurrentWindow();
    window.hide();
})

document.getElementById("select").addEventListener("click", function(e){
    if(!colorTypeWindowVisibleState){
        let windowBounds = remote.getCurrentWindow().getBounds()

        let windowY = windowBounds.y + 50;
        let windowScreen = remote.screen.getDisplayNearestPoint({
            x: windowBounds.x,
            y: windowBounds.y
        })
        if(windowY + 260 >= windowScreen.bounds.height){
            windowY = windowY - 260 - 45;
        }

        colorTypesWindow.setBounds({
            width: 340,
            height: 260,
            x: windowBounds.x + 30,
            y: windowY
        },false);
        colorTypeWindowVisibleState = true;
        document.getElementById("select").classList.add("active");
        colorTypesWindow.show();
    }
    else{
        colorTypesWindow.hide();
        colorTypeWindowVisibleState = false;
        document.getElementById("select").classList.remove("active");
    }
});
