import { test } from "node:test";
import assert from "node:assert/strict";
import { canSetAttendance } from "./attendance";

test("canSetAttendance allows registered -> attended and attended -> registered", () => {
  assert.equal(canSetAttendance("registered", "attended"), true);
  assert.equal(canSetAttendance("attended", "registered"), true);
});

test("canSetAttendance disallows identical status transitions and cancelled transitions", () => {
  assert.equal(canSetAttendance("registered", "registered"), false);
  assert.equal(canSetAttendance("attended", "attended"), false);
  assert.equal(canSetAttendance("cancelled", "attended"), false);
  assert.equal(canSetAttendance("cancelled", "registered"), false);
});

