// Initializing App Require Statements
const log = require("electron-log");
const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname + "../../../electron-builder.env")
});
log.info(
  "\n" +
    " ____  ____   __  ____\n" +
    "(    \\(  _ \\ /  \\(  _  \\ \n" +
    " ) D ( )   /(  O )) __/\n" +
    "(____/(__\\_) \\__/(__)\n" +
    ""
);
log.info("Loading Dependencies");
const electron = require("electron");
const { app } = electron;
const Sentry = require("@sentry/electron");

console.log(process.env.DSN);

Sentry.init({
  dsn: process.env.DSN,
  release: "Drop@" + process.env.npm_package_version
});

const WindowManager = require("./windows/WindowManager");
const AppController = require("./app/AppController");

const Store = require("electron-store");
const store = new Store();

const windowBoss = new WindowManager();

// Initializing App Controller
log.info("Initializing");
new AppController(app, store, windowBoss);
