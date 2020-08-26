const Application = require("spectron").Application;
const assert = require("assert");
const path = require("path");

describe("End To End Electron Testing Using Spectron", function() {
  describe("Application launch", function() {
    this.timeout(30000);

    beforeEach(function() {
      this.app = new Application({
        path: path.resolve(__dirname, "../../node_modules/.bin/electron"),
        args: [path.join(__dirname, "../..")],
        env: {
          ELECTRON_ENABLE_LOGGING: true,
          ELECTRON_ENABLE_STACK_DUMPING: true,
          NODE_ENV: "test"
        },
        chromeDriverArgs: ["no-sandbox"],
        startTimeout: 50000
      });
      return this.app.start();
    });

    afterEach(function() {
      if (this.app && this.app.isRunning()) {
        return this.app.stop();
      }
    });

    it("sanity check", function() {
      return assert.ok(true);
    });

    it("should run", function() {
      return assert.strictEqual(this.app.isRunning(), true);
    });

    it("should create a hidden history and picker window", function() {
      return this.app.client.getWindowCount().then(function(count) {
        assert.strictEqual(count, 2);
      });
    });
  });
});
