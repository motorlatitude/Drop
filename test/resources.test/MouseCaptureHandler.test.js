const assert = require("assert");

describe("Checking MouseCaptureHandler", function() {
  this.timeout(30000);
  beforeEach(function() {
    process.env.NODE_ENV = "test";
    this.MouseCaptureHandler = require("../../src/main/resources/MouseCaptureHandler");
    const path = require("path");
    require("dotenv").config({
      path: path.resolve(__dirname + "../../../electron-builder.env")
    });
    const WindowManager = require("./../../src/main/windows/WindowManager");
    const PickerWindowController = require("./../../src/main/windows/PickerWindowController");

    const Store = require("electron-store");
    this.store = new Store();

    this.windowBoss = new WindowManager();
    this.pickerWindowController = new PickerWindowController(
      this.windowBoss,
      this.store
    );
  });

  afterEach(function() {
    this.MouseCaptureHandler = undefined;
  });

  it("Should default Picker Size to 17", function() {
    const mch = new this.MouseCaptureHandler(
      this.windowBoss,
      this.store,
      this.pickerWindowController
    );
    return assert.strictEqual(mch.PickerSize, 17);
  });

  it("Should start polling", function() {
    const mch = new this.MouseCaptureHandler(
      this.windowBoss,
      this.store,
      this.pickerWindowController
    );
    mch.startPolling();
    return (
      assert.strictEqual(typeof mch._PollingInterval, "object") &&
      assert.strictEqual(mch._PollingInterval._destroyed, false)
    );
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
      setTimeout(() => {
        return done();
      }, 1000);
    }, 1000);
  });
});
