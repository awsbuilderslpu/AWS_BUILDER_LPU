import { test } from "node:test";
import assert from "node:assert/strict";
import { viewerKind } from "./viewer";
import type { AccountSummary } from "../auth/account";

test("viewerKind returns anonymous for null account", () => {
  assert.equal(viewerKind(null), "anonymous");
});

test("viewerKind returns signed-in-not-member for pending account", () => {
  const account: AccountSummary = {
    id: "user-1",
    email: "pending@example.com",
    displayName: "Pending User",
    role: "participant",
    isActive: true,
    registrationStatus: "pending",
    profileComplete: true,
  };
  assert.equal(viewerKind(account), "signed-in-not-member");
});

test("viewerKind returns signed-in-not-member for approved inactive account", () => {
  const account: AccountSummary = {
    id: "user-2",
    email: "inactive@example.com",
    displayName: "Inactive User",
    role: "participant",
    isActive: false,
    registrationStatus: "approved",
    profileComplete: true,
  };
  assert.equal(viewerKind(account), "signed-in-not-member");
});

test("viewerKind returns member for approved active participant", () => {
  const account: AccountSummary = {
    id: "user-3",
    email: "participant@example.com",
    displayName: "Active Participant",
    role: "participant",
    isActive: true,
    registrationStatus: "approved",
    profileComplete: true,
  };
  assert.equal(viewerKind(account), "member");
});

test("viewerKind returns member for approved active admin", () => {
  const account: AccountSummary = {
    id: "user-4",
    email: "admin@example.com",
    displayName: "Active Admin",
    role: "admin",
    isActive: true,
    registrationStatus: "approved",
    profileComplete: true,
  };
  assert.equal(viewerKind(account), "member");
});

test("viewerKind returns signed-in-not-member for staff without approved registration", () => {
  const account: AccountSummary = {
    id: "user-5",
    email: "staff@example.com",
    displayName: "Staff User",
    role: "core",
    isActive: true,
    registrationStatus: "pending",
    profileComplete: true,
  };
  assert.equal(viewerKind(account), "signed-in-not-member");
});

