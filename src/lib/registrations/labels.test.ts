import test, { describe } from "node:test";
import assert from "node:assert/strict";
import { displayName, programmeLabel } from "./labels";

describe("registrations labels helper", () => {
  test("displayName combines first and last name or falls back to (no name)", () => {
    assert.equal(displayName("Jane", "Doe"), "Jane Doe");
    assert.equal(displayName("  Jane  ", "  Doe  "), "Jane Doe");
    assert.equal(displayName("Jane", null), "Jane");
    assert.equal(displayName(null, "Doe"), "Doe");
    assert.equal(displayName("", ""), "(no name)");
    assert.equal(displayName("   ", null), "(no name)");
    assert.equal(displayName(null, null), "(no name)");
    assert.equal(displayName(undefined, undefined), "(no name)");
  });

  test("programmeLabel formats programme and department correctly", () => {
    const depts = [
      { value: "cse", short: "CSE" },
      { value: "it", short: "IT" },
    ];

    assert.equal(programmeLabel("B.Tech", "cse", depts), "B.Tech (CSE)");
    assert.equal(programmeLabel("B.Tech", "unknown", depts), "B.Tech");
    assert.equal(programmeLabel("B.Tech", null, depts), "B.Tech");
    assert.equal(programmeLabel("B.Tech", "", depts), "B.Tech");
    assert.equal(programmeLabel(null, null, depts), "-");
    assert.equal(programmeLabel("", "", depts), "-");
    assert.equal(programmeLabel(undefined, undefined, depts), "-");
  });
});

