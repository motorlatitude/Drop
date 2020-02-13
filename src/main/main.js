// Initializing App Require Statements
const electron = require("electron");
const { app } = electron;

const WindowManager = require("./windows/WindowManager");
const AppController = require("./app/AppController");

const Store = require("electron-store");
const store = new Store();

let windowBoss = new WindowManager();

// Initializing App Controller
const appController = new AppController(app, store, windowBoss);
