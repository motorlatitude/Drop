const Application = require("spectron").Application;
const assert = require("assert");
const electronPath = require("electron"); // Require Electron from the binaries included in node_modules.
const path = require("path");

describe("Application launch", function() {
  this.timeout(10000);

  beforeEach(function() {
    this.app = new Application({
      path: electronPath,
      args: [path.join(__dirname, "..")]
    });
    return this.app.start();
  });

  afterEach(function() {
    if (this.app && this.app.isRunning()) {
      return this.app.stop();
    }
  });

  it("should run", function() {
    return assert.equal(this.app.isRunning(), true);
  });

  it("should create a hidden history and picker window", function() {
    return this.app.client.getWindowCount().then(function(count) {
      assert.equal(count, 2);
    });
  });
});
