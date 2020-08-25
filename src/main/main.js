// Initializing App Require Statements
const log = require("electron-log");
const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname + "../../../electron-builder.env")
});
if (process.env.NODE_ENV === "test") {
  log.transports.file.level = false;
  log.transports.console.level = false;
}
log.info(
  "\n" +
    " ____  ____   __  ____\n" +
    "(    \\(  _ \\ /  \\(  _  \\ \n" +
    " ) D ( )   /(  O ))  __/\n" +
    "(____/(__\\_) \\__/(__)\n" +
    ""
);
log.info("Loading Dependencies");
const electron = require("electron");
const { app } = electron;
const Sentry = require("@sentry/electron");

const release = "Drop@" + process.env.npm_package_version;
log.info("Release", release);

Sentry.init({
  dsn: process.env.DSN,
  release: release
});

Sentry.captureMessage("Starting Drop");

const WindowManager = require("./windows/WindowManager");
const AppController = require("./app/AppController");

const Store = require("electron-store");
const store = new Store();

const windowBoss = new WindowManager();

// Initializing App Controller
log.info("Initializing");
const AC = new AppController(app, store, windowBoss);
module.exports = { controller: AC };
