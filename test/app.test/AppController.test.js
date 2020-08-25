const assert = require("assert");

describe("Checking AppController", function() {
  this.timeout(30000);
  beforeEach(function() {
    process.env.NODE_ENV = "test";
  });

  afterEach(function() {
    this.main = undefined;
  });

  it("Sanity Check", function() {
    return assert.strictEqual(true, true) && assert.strictEqual(2 + 2, 4);
  });
});
