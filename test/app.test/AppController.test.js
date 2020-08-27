const assert = require("assert");

describe("Checking AppController", function() {
  this.timeout(30000);
  beforeEach(function() {
    process.env.NODE_ENV = "test";
    const path = require("path");
    require("dotenv").config({
      path: path.resolve(__dirname + "../../../electron-builder.env")
    });
    this.AppController = require("../../src/main/app/AppController");
    const Store = require("electron-store");
    const WindowManager = require("../../src/main/windows/WindowManager");
    const { app } = require("electron");
    this.App = app;
    this.store = new Store();
    this.app = app;
    this.windowBoss = new WindowManager();
  });

  afterEach(function() {
    this.AppController = undefined;
    this.App = undefined;
    this.store = undefined;
    this.app = undefined;
    this.windowBoss = undefined;
  });

  it("Sanity Check", function() {
    return assert.strictEqual(true, true) && assert.strictEqual(2 + 2, 4);
  });

  it("Should Create AppController and set properties", function() {
    const ac = new this.AppController(this.App, this.store, this.windowBoss);
    return (
      assert.strictEqual(ac._App, this.App) &&
      assert.strictEqual(ac._Store, this.store) &&
      assert.strictEqual(ac._WindowManager, this.windowBoss)
    );
  });

  it("Once ready is sent should create picker window", function(done) {
    const ac = new this.AppController(this.App, this.store, this.windowBoss);
    ac._App.emit("ready");
    setTimeout(() => {
      assert.strictEqual(typeof ac._WindowManager.windows.picker, "object");
      done();
    }, 10000);
  });
});
