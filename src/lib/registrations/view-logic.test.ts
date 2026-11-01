import test, { describe } from "node:test";
import assert from "node:assert/strict";
import {
  rowName,
  commonActions,
  clampPage,
  differingRoleCount,
  hasAdminRequest,
  initialApprovalRole,
  summarizeResults,
  tabToLabel,
  labelToTab,
} from "./view-logic";
import type { AppRole } from "../auth/account";

describe("registrations view-logic helper", () => {
  test("rowName returns full name, then email, then (no name)", () => {
    assert.equal(rowName({ fullName: "Jane Doe", email: "jane@example.com" }), "Jane Doe");
    assert.equal(rowName({ fullName: "", email: "jane@example.com" }), "jane@example.com");
    assert.equal(rowName({ fullName: "   ", email: null }), "(no name)");
    assert.equal(rowName({ fullName: null, email: undefined }), "(no name)");
  });

  test("commonActions computes the intersection of allowed actions across statuses", () => {
    assert.deepEqual(commonActions([]), []);
    assert.deepEqual(commonActions(["pending"]), ["approve", "reject", "archive"]);
    assert.deepEqual(commonActions(["pending", "pending"]), ["approve", "reject", "archive"]);
    assert.deepEqual(commonActions(["pending", "approved"]), ["archive"]);
    assert.deepEqual(commonActions(["pending", "rejected"]), ["archive"]);
    assert.deepEqual(commonActions(["approved", "archived"]), []);
    assert.deepEqual(commonActions(["rejected", "rejected"]), ["reopen", "archive"]);
    assert.deepEqual(commonActions(["archived"]), ["restore"]);
  });

  test("clampPage handles boundaries, zero totals, and out-of-range pages", () => {
    assert.equal(clampPage(1, 10, 0), 1);
    assert.equal(clampPage(5, 10, 43), 5);
    assert.equal(clampPage(6, 10, 43), 5);
    assert.equal(clampPage(0, 10, 43), 1);
    assert.equal(clampPage(3, 25, 0), 1);
    assert.equal(clampPage(-2, 10, 100), 1);
  });

  test("differingRoleCount and hasAdminRequest work as expected", () => {
    const requested: AppRole[] = ["student", "member", "student", "core"];
    assert.equal(differingRoleCount(requested, "student"), 2);
    assert.equal(differingRoleCount(requested, "participant"), 4);
    assert.equal(hasAdminRequest(requested), false);

    const withAdmin: AppRole[] = ["student", "admin"];
    assert.equal(hasAdminRequest(withAdmin), true);
  });

  test("initialApprovalRole never pre-selects elevated roles and defaults safely", () => {
    assert.equal(initialApprovalRole(["student"]), "student");
    assert.equal(initialApprovalRole(["participant"]), "participant");
    assert.equal(initialApprovalRole(["member"]), "member");
    assert.equal(initialApprovalRole(["core"]), "student"); // elevated role never pre-selected
    assert.equal(initialApprovalRole(["admin"]), "student");
    assert.equal(initialApprovalRole(["student", "member"]), "student"); // several requests
    assert.equal(initialApprovalRole([]), "student"); // none
  });

  test("summarizeResults tallies ok/failed counts, ranks errors by frequency, and ignores email for failed items", () => {
    const results = [
      { id: "1", ok: true, email: "sent" as const },
      { id: "2", ok: true, email: "sent" as const },
      { id: "3", ok: true, email: "failed" as const },
      { id: "4", ok: true, email: "not_configured" as const },
      { id: "5", ok: true, email: "skipped" as const },
      { id: "6", ok: false, error: "not_found", email: "sent" as const }, // email ignored because ok is false
      { id: "7", ok: false, error: "invalid_transition" },
      { id: "8", ok: false, error: "invalid_transition" },
    ];

    const summary = summarizeResults(results);
    assert.equal(summary.okCount, 5);
    assert.equal(summary.failedCount, 3);
    // invalid_transition appears twice, not_found once -> invalid_transition comes first
    assert.deepEqual(summary.errorCodes, ["invalid_transition", "not_found"]);
    assert.deepEqual(summary.email, {
      sent: 2,
      failed: 1,
      notConfigured: 1,
      skipped: 1,
    });
  });

  test("tabToLabel and labelToTab round-trip with fallback for unknown values", () => {
    const tabs = ["all", "pending", "approved", "rejected", "archived"];
    const labels: Record<string, string> = {
      all: "All Registrations",
      pending: "Pending",
      approved: "Approved",
      rejected: "Rejected",
      archived: "Archived",
    };

    assert.equal(tabToLabel("pending", tabs, labels), "Pending");
    assert.equal(tabToLabel("unknown", tabs, labels), "All Registrations");

    assert.equal(labelToTab("Pending", tabs, labels), "pending");
    assert.equal(labelToTab("NonExistent", tabs, labels), "all");
  });
});

