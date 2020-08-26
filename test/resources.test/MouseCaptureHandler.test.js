const assert = require("assert");

describe("Setting up MouseCaptureHandler", function() {
  this.timeout(30000);
  before(function() {
    process.env.NODE_ENV = "test";
    this.MouseCaptureHandler = require("../../src/main/resources/MouseCaptureHandler");
    const path = require("path");
    require("dotenv").config({
      path: path.resolve(__dirname + "../../../electron-builder.env")
    });
    const { app } = require("electron");
    const WindowManager = require("./../../src/main/windows/WindowManager");
    const PickerWindowController = require("./../../src/main/windows/PickerWindowController");
    const AppController = require("./../../src/main/app/AppController");
    const TrayController = require("./../../src/main/app/TrayController");
    const ColorFormats = require("./../../src/main/resources/ColorFormats");
    const Updater = require("./../../src/main/resources/Updater");
    const MessageHandler = require("./../../src/main/ipc/MessageHandler");
    const Store = require("electron-store");
    /**
     * Setup entire internal app structure since the messageHandler is required
     * app ready event is not fired so initialization of certain parts has to be done
     * manually
     */
    this.store = new Store();
    this.app = app;
    this.windowBoss = new WindowManager();
    this.ac = new AppController(app, this.store, this.windowBoss);
    const trayController = new TrayController(this.windowBoss, this.store);
    const updater = new Updater(this.store, this.windowBoss);
    if (!this.messageHandler) {
      new ColorFormats().then(({ c: colors, cf: colorFormats }) => {
        this.messageHandler = new MessageHandler(
          this.ac,
          this.windowBoss,
          this.store,
          trayController,
          colorFormats,
          updater
        );
        this.messageHandler.setupListeners();
      });
    }
    this.pickerWindowController = new PickerWindowController(
      this.windowBoss,
      this.store
    );
  });

  after(function() {
    this.messageHandler = undefined;
  });

  describe("Testing MouseCaptureHandler", function() {
    it("Should default Picker Size to 17", function() {
      const mch = new this.MouseCaptureHandler(
        this.windowBoss,
        this.store,
        this.pickerWindowController
      );
      assert.strictEqual(mch.PickerSize, 17);
    });

    it("Should start polling", function(done) {
      const mch = new this.MouseCaptureHandler(
        this.windowBoss,
        this.store,
        this.pickerWindowController
      );
      mch.startPolling();
      assert.strictEqual(typeof mch._PollingInterval, "object");
      assert.strictEqual(mch._PollingInterval._destroyed, false);
      setTimeout(() => {
        mch.stopPolling();
        return done();
      }, 1000);
    });

    it("Should stop polling", function(done) {
      const mch = new this.MouseCaptureHandler(
        this.windowBoss,
        this.store,
        this.pickerWindowController
      );
      mch.startPolling();
      setTimeout(() => {
        mch.stopPolling();
        assert.strictEqual(mch._PollingInterval, null);
        return done();
      }, 1000);
    });
  });
});
