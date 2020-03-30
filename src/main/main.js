// Initializing App Require Statements
const log = require("electron-log");
log.info("Loading Dependencies");
const electron = require("electron");
const { app } = electron;

const WindowManager = require("./windows/WindowManager");
const AppController = require("./app/AppController");

const Store = require("electron-store");
const store = new Store();

const windowBoss = new WindowManager();

// Initializing App Controller
log.info("Initializing");
new AppController(app, store, windowBoss);
