import assert from "assert";
import app from "../../src/app";

describe("Testing various configs", () => {
  it("registered the service", () => {
    const service = app.service("api-keys");

    assert.ok(service, "Registered the service");
  });
});
