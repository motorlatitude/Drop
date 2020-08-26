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
    new this.ColorFormats().then(({ c: c, cf: cf }) => {
      assert.strictEqual(c.length, 9);
      done();
    });
  });

  it("Should select the first color format as the selected color format", function(done) {
    new this.ColorFormats().then(({ c: c, cf: cf }) => {
      assert.strictEqual(c[0].value, cf.selectedFormat);
      done();
    });
  });

  it("Should set selected color format", function(done) {
    new this.ColorFormats().then(({ c: c, cf: cf }) => {
      const selColor = c[1].value;
      cf.selectedFormat = selColor;
      assert.strictEqual(cf.selectedFormat, selColor);
      done();
    });
  });

  it("Should reload formats and return formats list", function(done) {
    new this.ColorFormats().then(({ c: c, cf: cf }) => {
      cf.updateFormats(formats => {
        assert.strictEqual(formats.length, 9);
        done();
      });
    });
  });
});
