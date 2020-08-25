const assert = require("assert");

describe("Checking Default Settings", function() {
  this.timeout(30000);
  beforeEach(function() {
    process.env.NODE_ENV = "test";
    this.DefaultSettings = require("../../src/main/resources/Defaults").defaultSettings;
  });

  afterEach(function() {
    this.DefaultSettings = undefined;
  });

  it("Check shortcutOpenMagnifier is true", function() {
    return assert.strictEqual(this.DefaultSettings.shortcutOpenMagnifier, true);
  });

  it("Check launchOnStartup is true", function() {
    return assert.strictEqual(this.DefaultSettings.launchOnStartup, true);
  });

  it("Check playSounds is true", function() {
    return assert.strictEqual(this.DefaultSettings.playSounds, true);
  });

  it("Check isHistoryLimit is false", function() {
    return assert.strictEqual(this.DefaultSettings.isHistoryLimit, false);
  });

  it('Check historyLimit is "30"', function() {
    return assert.strictEqual(this.DefaultSettings.historyLimit, "30");
  });

  it("Check showPickedColor is true", function() {
    return assert.strictEqual(this.DefaultSettings.showPickedColor, true);
  });

  it('Check colorProfile is "default"', function() {
    return assert.strictEqual(this.DefaultSettings.colorProfile, "default");
  });

  it("Check createNewPaletteOnPick is true", function() {
    return assert.strictEqual(
      this.DefaultSettings.createNewPaletteOnPick,
      true
    );
  });

  it("Check pollingRate is 1", function() {
    return assert.strictEqual(this.DefaultSettings.pollingRate, 1);
  });

  it("Check quickPicking is true", function() {
    return assert.strictEqual(this.DefaultSettings.quickPicking, true);
  });

  it("Check historyWindowBounds is object", function() {
    return (
      assert.strictEqual(this.DefaultSettings.historyWindowBounds.x, 0) &&
      assert.strictEqual(this.DefaultSettings.historyWindowBounds.y, 0) &&
      assert.strictEqual(this.DefaultSettings.historyWindowBounds.width, 390) &&
      assert.strictEqual(this.DefaultSettings.historyWindowBounds.height, 210)
    );
  });
});
