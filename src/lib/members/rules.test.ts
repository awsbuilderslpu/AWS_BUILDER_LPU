import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  roleChangeKind,
  canChangeRole,
  canSetActive,
  canRemove,
  splitBulk,
  type MemberTarget,
} from "./rules";

describe("members rules helper", () => {
  it("roleChangeKind classifies promote, demote, and same correctly", () => {
    assert.equal(roleChangeKind("participant", "student"), "promote");
    assert.equal(roleChangeKind("student", "core"), "promote");
    assert.equal(roleChangeKind("core", "admin"), "promote");

    assert.equal(roleChangeKind("admin", "core"), "demote");
    assert.equal(roleChangeKind("core", "member"), "demote");
    assert.equal(roleChangeKind("member", "participant"), "demote");

    assert.equal(roleChangeKind("admin", "admin"), "same");
    assert.equal(roleChangeKind("core", "core"), "same");
    assert.equal(roleChangeKind("student", "student"), "same");
  });

  describe("canChangeRole", () => {
    const actorId = "admin-1";

    it("refuses self-target even if role is also unchanged (order of checks)", () => {
      const target: MemberTarget = {
        userId: actorId,
        role: "admin",
        isActive: true,
        registrationStatus: "approved",
      };
      const res = canChangeRole({ actorId, target, newRole: "admin" });
      assert.deepEqual(res, { ok: false, reason: "self" });
    });

    it("refuses self-target for a different role", () => {
      const target: MemberTarget = {
        userId: actorId,
        role: "admin",
        isActive: true,
        registrationStatus: "approved",
      };
      const res = canChangeRole({ actorId, target, newRole: "core" });
      assert.deepEqual(res, { ok: false, reason: "self" });
    });

    it("refuses no-change for non-self target", () => {
      const target: MemberTarget = {
        userId: "user-2",
        role: "core",
        isActive: true,
        registrationStatus: "approved",
      };
      const res = canChangeRole({ actorId, target, newRole: "core" });
      assert.deepEqual(res, { ok: false, reason: "no_change" });
    });

    it("refuses bulk change when newRole is admin", () => {
      const target: MemberTarget = {
        userId: "user-2",
        role: "member",
        isActive: true,
        registrationStatus: "approved",
      };
      const res = canChangeRole({
        actorId,
        target,
        newRole: "admin",
        bulk: true,
      });
      assert.deepEqual(res, { ok: false, reason: "admin_individually" });
    });

    it("refuses bulk change when target is an admin", () => {
      const target: MemberTarget = {
        userId: "user-2",
        role: "admin",
        isActive: true,
        registrationStatus: "approved",
      };
      const res = canChangeRole({
        actorId,
        target,
        newRole: "core",
        bulk: true,
      });
      assert.deepEqual(res, { ok: false, reason: "admin_individually" });
    });

    it("refuses admin grant when target is inactive", () => {
      const target: MemberTarget = {
        userId: "user-2",
        role: "core",
        isActive: false,
        registrationStatus: "approved",
      };
      const res = canChangeRole({ actorId, target, newRole: "admin" });
      assert.deepEqual(res, {
        ok: false,
        reason: "admin_needs_approved_active",
      });
    });

    it("refuses admin grant when registration is not approved", () => {
      const target: MemberTarget = {
        userId: "user-2",
        role: "core",
        isActive: true,
        registrationStatus: "pending",
      };
      const res = canChangeRole({ actorId, target, newRole: "admin" });
      assert.deepEqual(res, {
        ok: false,
        reason: "admin_needs_approved_active",
      });
    });

    it("allows valid role change for individual target", () => {
      const target: MemberTarget = {
        userId: "user-2",
        role: "student",
        isActive: true,
        registrationStatus: "approved",
      };
      const res = canChangeRole({ actorId, target, newRole: "core" });
      assert.deepEqual(res, { ok: true });
    });

    it("allows admin grant for approved active target individually", () => {
      const target: MemberTarget = {
        userId: "user-2",
        role: "core",
        isActive: true,
        registrationStatus: "approved",
      };
      const res = canChangeRole({
        actorId,
        target,
        newRole: "admin",
        bulk: false,
      });
      assert.deepEqual(res, { ok: true });
    });
  });

  describe("canSetActive", () => {
    const actorId = "admin-1";

    it("refuses self-target even if active status is unchanged", () => {
      const target: MemberTarget = {
        userId: actorId,
        role: "admin",
        isActive: true,
        registrationStatus: "approved",
      };
      const res = canSetActive({ actorId, target, active: true });
      assert.deepEqual(res, { ok: false, reason: "self" });
    });

    it("refuses no_change when active matches current isActive", () => {
      const target: MemberTarget = {
        userId: "user-2",
        role: "member",
        isActive: true,
        registrationStatus: "approved",
      };
      const res = canSetActive({ actorId, target, active: true });
      assert.deepEqual(res, { ok: false, reason: "no_change" });
    });

    it("refuses bulk deactivation for admin target", () => {
      const target: MemberTarget = {
        userId: "user-2",
        role: "admin",
        isActive: true,
        registrationStatus: "approved",
      };
      const res = canSetActive({
        actorId,
        target,
        active: false,
        bulk: true,
      });
      assert.deepEqual(res, { ok: false, reason: "admin_individually" });
    });

    it("allows valid status toggle", () => {
      const target: MemberTarget = {
        userId: "user-2",
        role: "member",
        isActive: true,
        registrationStatus: "approved",
      };
      const res = canSetActive({ actorId, target, active: false });
      assert.deepEqual(res, { ok: true });
    });
  });

  describe("canRemove", () => {
    const actorId = "admin-1";

    it("refuses self-target", () => {
      const target: MemberTarget = {
        userId: actorId,
        role: "admin",
        isActive: true,
        registrationStatus: "approved",
      };
      const res = canRemove({ actorId, target });
      assert.deepEqual(res, { ok: false, reason: "self" });
    });

    it("refuses removal of admin target with demote_admin_first", () => {
      const target: MemberTarget = {
        userId: "user-2",
        role: "admin",
        isActive: true,
        registrationStatus: "approved",
      };
      const res = canRemove({ actorId, target });
      assert.deepEqual(res, { ok: false, reason: "demote_admin_first" });
    });

    it("allows removal of non-admin member", () => {
      const target: MemberTarget = {
        userId: "user-2",
        role: "member",
        isActive: true,
        registrationStatus: "approved",
      };
      const res = canRemove({ actorId, target });
      assert.deepEqual(res, { ok: true });
    });
  });

  describe("splitBulk", () => {
    const actorId = "admin-1";

    it("splits actor (self wins over admin), admin, and normal members", () => {
      const selfAdmin: MemberTarget = {
        userId: actorId,
        role: "admin",
        isActive: true,
        registrationStatus: "approved",
      };
      const otherAdmin: MemberTarget = {
        userId: "admin-2",
        role: "admin",
        isActive: true,
        registrationStatus: "approved",
      };
      const normalMember: MemberTarget = {
        userId: "user-3",
        role: "member",
        isActive: true,
        registrationStatus: "approved",
      };

      const { eligible, skipped } = splitBulk(
        [selfAdmin, otherAdmin, normalMember],
        actorId
      );

      assert.equal(eligible.length, 1);
      assert.equal(eligible[0].userId, "user-3");

      assert.equal(skipped.length, 2);
      assert.equal(skipped[0].target.userId, actorId);
      assert.equal(skipped[0].reason, "self");
      assert.equal(skipped[1].target.userId, "admin-2");
      assert.equal(skipped[1].reason, "admin_individually");
    });
  });
});

