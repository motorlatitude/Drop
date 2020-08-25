const assert = require("assert");

describe("Checking Main", function() {
  this.timeout(30000);
  beforeEach(function() {
    process.env.NODE_ENV = "test";
    this.main = require("../src/main/main");
  });

  afterEach(function() {
    this.main = undefined;
  });

  it("Should create an AppController", function() {
    return assert.strictEqual(
      this.main.controller.constructor.name,
      "AppController"
    );
  });
});
