const assert = require("assert");

describe("Checking KeyAssignments", function() {
  this.timeout(30000);
  beforeEach(function() {
    process.env.NODE_ENV = "test";
    this.KeyAssignment = require("../../src/main/resources/KeyAssignment");
  });

  afterEach(function() {
    this.KeyAssignment = undefined;
  });

  it("I key should return I", function() {
    return assert.strictEqual(this.KeyAssignment.format(["I"]), "I");
  });

  it('["Control","I"] key should return CommandOrControl+I', function() {
    return assert.strictEqual(
      this.KeyAssignment.format(["Control", "I"]),
      "CommandOrControl+I"
    );
  });

  it('["Command","I"] key should return CommandOrControl+I', function() {
    return assert.strictEqual(
      this.KeyAssignment.format(["Command", "I"]),
      "CommandOrControl+I"
    );
  });

  it('["ArrowUp"] key should return Up', function() {
    return assert.strictEqual(this.KeyAssignment.format(["ArrowUp"]), "Up");
  });

  it('["ArrowDown"] key should return Down', function() {
    return assert.strictEqual(this.KeyAssignment.format(["ArrowDown"]), "Down");
  });

  it('["ArrowLeft"] key should return Left', function() {
    return assert.strictEqual(this.KeyAssignment.format(["ArrowLeft"]), "Left");
  });

  it('["ArrowRight"] key should return Right', function() {
    return assert.strictEqual(
      this.KeyAssignment.format(["ArrowRight"]),
      "Right"
    );
  });
});
