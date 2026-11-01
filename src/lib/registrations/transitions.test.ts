import test, { describe } from "node:test";
import assert from "node:assert/strict";
import type { RegistrationStatus } from "../auth/account";
import {
  allowedActions,
  nextStatus,
  defaultApprovalRole,
  sendsEmail,
} from "./transitions";
import type { ReviewAction } from "./types";

describe("registrations transitions helper", () => {
  test("allowedActions returns the expected actions per status", () => {
    assert.deepEqual(allowedActions("pending"), ["approve", "reject", "archive"]);
    assert.deepEqual(allowedActions("approved"), ["archive"]);
    assert.deepEqual(allowedActions("rejected"), ["reopen", "archive"]);
    assert.deepEqual(allowedActions("archived"), ["restore"]);
  });

  test("all 20 status/action combinations against the state machine table", () => {
    const statuses: RegistrationStatus[] = ["pending", "approved", "rejected", "archived"];
    const actions: ReviewAction[] = ["approve", "reject", "archive", "reopen", "restore"];

    const expectedMatrix: Record<RegistrationStatus, Record<ReviewAction, RegistrationStatus | null>> = {
      pending: {
        approve: "approved",
        reject: "rejected",
        archive: "archived",
        reopen: null,
        restore: null,
      },
      approved: {
        approve: null,
        reject: null,
        archive: "archived",
        reopen: null,
        restore: null,
      },
      rejected: {
        approve: null,
        reject: null,
        archive: "archived",
        reopen: "pending",
        restore: null,
      },
      archived: {
        approve: null,
        reject: null,
        archive: null,
        reopen: null,
        restore: "pending", // default without role or participant
      },
    };

    let count = 0;
    for (const status of statuses) {
      for (const action of actions) {
        count++;
        const next = nextStatus(status, action, "participant");
        assert.equal(next, expectedMatrix[status][action]);
      }
    }
    assert.equal(count, 20);
  });

  test("restore rule depends on currentRole (null or participant -> pending, above -> approved)", () => {
    assert.equal(nextStatus("archived", "restore", null), "pending");
    assert.equal(nextStatus("archived", "restore", "participant"), "pending");
    assert.equal(nextStatus("archived", "restore", "student"), "approved");
    assert.equal(nextStatus("archived", "restore", "core"), "approved");
    assert.equal(nextStatus("archived", "restore", "member"), "approved");
  });

  test("defaultApprovalRole maps five roles correctly (admin gives student)", () => {
    assert.equal(defaultApprovalRole("admin"), "student");
    assert.equal(defaultApprovalRole("core"), "core");
    assert.equal(defaultApprovalRole("member"), "member");
    assert.equal(defaultApprovalRole("student"), "student");
    assert.equal(defaultApprovalRole("participant"), "participant");
  });

  test("sendsEmail returns true only for approve and reject", () => {
    assert.equal(sendsEmail("approve"), true);
    assert.equal(sendsEmail("reject"), true);
    assert.equal(sendsEmail("archive"), false);
    assert.equal(sendsEmail("reopen"), false);
    assert.equal(sendsEmail("restore"), false);
  });
});
