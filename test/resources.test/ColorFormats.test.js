const assert = require("assert");

describe("Checking ColorFormats", function() {
  this.timeout(30000);
  beforeEach(function() {
    process.env.NODE_ENV = "test";
    this.ColorFormats = require("../../src/main/resources/ColorFormats");
  });

  afterEach(function() {
    this.ColorFormats = undefined;
  });

  it("ColorFormats construction should create ColorFormats object", function() {
    const c = new this.ColorFormats();
    return assert.strictEqual(typeof c, "object");
  });

  it("ColorFormats should load color formats on constructions and store in _colorFormats", function(done) {
    const c = new this.ColorFormats();
    setTimeout(() => {
      assert.strictEqual(c.formats.length, 9);
      done();
    }, 5000);
  });

  it("Should select the first color format as the selected color format", function(done) {
    const c = new this.ColorFormats();
    setTimeout(() => {
      assert.strictEqual(c.formats[0].value, c.selectedFormat);
      done();
    }, 5000);
  });

  it("Should set selected color format", function(done) {
    const c = new this.ColorFormats();
    setTimeout(() => {
      const selColor = c.formats[1].value;
      c.selectedFormat = selColor;
      assert.strictEqual(c.selectedFormat, selColor);
      done();
    }, 5000);
  });

  it("Should reload formats and return formats list", function(done) {
    const c = new this.ColorFormats();
    setTimeout(() => {
      c.updateFormats(formats => {
        assert.strictEqual(formats.length, 9);
        done();
      });
    }, 5000);
  });
});
