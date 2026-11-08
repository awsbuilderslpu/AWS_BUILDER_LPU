import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  roleChoices,
  adminChoice,
  splitRoleChange,
  splitActiveChange,
  rowNumber,
  departmentLabel,
  countByReason,
} from "./view-logic";
import type { MemberTarget } from "./rules";

describe("members view-logic helper", () => {
  it("roleChoices returns bulkRoles when bulk is true, all 5 roles when false", () => {
    assert.deepEqual(roleChoices(true), [
      "student",
      "participant",
      "member",
      "core",
    ]);
    assert.deepEqual(roleChoices(false), [
      "student",
      "participant",
      "member",
      "core",
      "admin",
    ]);
  });

  describe("adminChoice", () => {
    const actorId = "actor-111";

    it("returns self when target is actor", () => {
      const target: MemberTarget = {
        userId: actorId,
        role: "member",
        isActive: true,
        registrationStatus: "approved",
      };
      assert.deepEqual(adminChoice(target, actorId), {
        enabled: false,
        reason: "self",
      });
    });

    it("returns current when target is already an admin", () => {
      const target: MemberTarget = {
        userId: "target-222",
        role: "admin",
        isActive: true,
        registrationStatus: "approved",
      };
      assert.deepEqual(adminChoice(target, actorId), {
        enabled: false,
        reason: "current",
      });
    });

    it("returns admin_needs_approved_active when member is not approved", () => {
      const target: MemberTarget = {
        userId: "target-333",
        role: "member",
        isActive: true,
        registrationStatus: "pending",
      };
      assert.deepEqual(adminChoice(target, actorId), {
        enabled: false,
        reason: "admin_needs_approved_active",
      });
    });

    it("returns admin_needs_approved_active when member is approved but inactive", () => {
      const target: MemberTarget = {
        userId: "target-444",
        role: "member",
        isActive: false,
        registrationStatus: "approved",
      };
      assert.deepEqual(adminChoice(target, actorId), {
        enabled: false,
        reason: "admin_needs_approved_active",
      });
    });

    it("returns enabled true when member is approved and active", () => {
      const target: MemberTarget = {
        userId: "target-555",
        role: "member",
        isActive: true,
        registrationStatus: "approved",
      };
      assert.deepEqual(adminChoice(target, actorId), {
        enabled: true,
      });
    });

    it("returns only_administrator when actor is not an administrator", () => {
      const target: MemberTarget = {
        userId: "target-555",
        role: "member",
        isActive: true,
        registrationStatus: "approved",
      };
      assert.deepEqual(adminChoice(target, actorId, "admin"), {
        enabled: false,
        reason: "only_administrator",
      });
    });
  });

  describe("splitRoleChange", () => {
    const actorId = "admin-actor";

    it("splits correctly in bulk mode", () => {
      const targets: MemberTarget[] = [
        {
          userId: actorId,
          role: "member",
          isActive: true,
          registrationStatus: "approved",
        },
        {
          userId: "admin-target",
          role: "admin",
          isActive: true,
          registrationStatus: "approved",
        },
        {
          userId: "same-role-target",
          role: "core",
          isActive: true,
          registrationStatus: "approved",
        },
        {
          userId: "eligible-target",
          role: "student",
          isActive: true,
          registrationStatus: "approved",
        },
      ];

      const res = splitRoleChange(targets, "core", actorId);
      assert.equal(res.applicable.length, 1);
      assert.equal(res.applicable[0].userId, "eligible-target");

      assert.equal(res.skipped.length, 3);
      assert.deepEqual(
        res.skipped.map((s) => ({ id: s.target.userId, reason: s.reason })),
        [
          { id: actorId, reason: "self" },
          { id: "admin-target", reason: "admin_individually" },
          { id: "same-role-target", reason: "no_change" },
        ]
      );
    });

    it("allows a single eligible member to be promoted to admin", () => {
      const singleTarget: MemberTarget = {
        userId: "eligible-member",
        role: "member",
        isActive: true,
        registrationStatus: "approved",
      };
      const res = splitRoleChange([singleTarget], "admin", actorId);
      assert.equal(res.applicable.length, 1);
      assert.equal(res.applicable[0].userId, "eligible-member");
      assert.equal(res.skipped.length, 0);
    });
  });

  describe("splitActiveChange", () => {
    const actorId = "admin-actor";

    it("splits correctly in bulk mode", () => {
      const targets: MemberTarget[] = [
        {
          userId: actorId,
          role: "member",
          isActive: true,
          registrationStatus: "approved",
        },
        {
          userId: "admin-target",
          role: "admin",
          isActive: true,
          registrationStatus: "approved",
        },
        {
          userId: "already-inactive",
          role: "student",
          isActive: false,
          registrationStatus: "approved",
        },
        {
          userId: "eligible-target",
          role: "member",
          isActive: true,
          registrationStatus: "approved",
        },
      ];

      const res = splitActiveChange(targets, false, actorId);
      assert.equal(res.applicable.length, 1);
      assert.equal(res.applicable[0].userId, "eligible-target");

      assert.equal(res.skipped.length, 3);
      assert.deepEqual(
        res.skipped.map((s) => ({ id: s.target.userId, reason: s.reason })),
        [
          { id: actorId, reason: "self" },
          { id: "admin-target", reason: "admin_individually" },
          { id: "already-inactive", reason: "no_change" },
        ]
      );
    });
  });

  it("rowNumber computes 1-based index across pages correctly", () => {
    // page 3, size 25, index 4 gives 55: (3 - 1) * 25 + 4 + 1 = 50 + 5 = 55
    assert.equal(rowNumber(4, 3, 25), 55);
    assert.equal(rowNumber(0, 1, 10), 1);
  });

  it("departmentLabel returns short code for known, raw for unknown, and '-' for null", () => {
    const depts = [
      { value: "cse", short: "CSE" },
      { value: "it", short: "IT" },
    ];
    assert.equal(departmentLabel("cse", depts), "CSE");
    assert.equal(departmentLabel("CSE", depts), "CSE");
    assert.equal(departmentLabel("mechanical", depts), "mechanical");
    assert.equal(departmentLabel(null, depts), "-");
    assert.equal(departmentLabel("", depts), "-");
  });

  it("countByReason tallies counts per reason accurately", () => {
    const skipped = [
      { reason: "self" },
      { reason: "admin_individually" },
      { reason: "self" },
      { reason: "no_change" },
      { reason: "admin_individually" },
    ];
    assert.deepEqual(countByReason(skipped), {
      self: 2,
      admin_individually: 2,
      no_change: 1,
    });
    assert.deepEqual(countByReason([]), {});
  });
});

