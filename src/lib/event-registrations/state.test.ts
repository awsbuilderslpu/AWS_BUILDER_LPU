import { test } from "node:test";
import assert from "node:assert/strict";
import { publicRegistrationState } from "./state";

test("publicRegistrationState returns sign-in for anonymous viewer regardless of other flags", () => {
  const result = publicRegistrationState({
    viewer: "anonymous",
    myStatus: null,
    isPublished: true,
    isArchived: false,
    registrationOpen: true,
    isFull: false,
    hasEnded: false,
  });
  assert.equal(result, "sign-in");
});

test("publicRegistrationState returns not-member for signed-in-not-member viewer", () => {
  const result = publicRegistrationState({
    viewer: "signed-in-not-member",
    myStatus: null,
    isPublished: true,
    isArchived: false,
    registrationOpen: true,
    isFull: false,
    hasEnded: false,
  });
  assert.equal(result, "not-member");
});

test("publicRegistrationState returns ended if hasEnded is true", () => {
  const result = publicRegistrationState({
    viewer: "member",
    myStatus: null,
    isPublished: true,
    isArchived: false,
    registrationOpen: true,
    isFull: false,
    hasEnded: true,
  });
  assert.equal(result, "ended");
});

test("publicRegistrationState returns registered when member is already registered", () => {
  const result = publicRegistrationState({
    viewer: "member",
    myStatus: "registered",
    isPublished: true,
    isArchived: false,
    registrationOpen: true,
    isFull: true,
    hasEnded: false,
  });
  assert.equal(result, "registered");
});

test("publicRegistrationState returns attended when member attended", () => {
  const result = publicRegistrationState({
    viewer: "member",
    myStatus: "attended",
    isPublished: true,
    isArchived: false,
    registrationOpen: true,
    isFull: false,
    hasEnded: false,
  });
  assert.equal(result, "attended");
});

test("publicRegistrationState returns closed when unpublished, archived or registration closed", () => {
  assert.equal(
    publicRegistrationState({
      viewer: "member",
      myStatus: null,
      isPublished: false,
      isArchived: false,
      registrationOpen: true,
      isFull: false,
      hasEnded: false,
    }),
    "closed"
  );

  assert.equal(
    publicRegistrationState({
      viewer: "member",
      myStatus: null,
      isPublished: true,
      isArchived: true,
      registrationOpen: true,
      isFull: false,
      hasEnded: false,
    }),
    "closed"
  );

  assert.equal(
    publicRegistrationState({
      viewer: "member",
      myStatus: null,
      isPublished: true,
      isArchived: false,
      registrationOpen: false,
      isFull: false,
      hasEnded: false,
    }),
    "closed"
  );
});

test("publicRegistrationState returns full when event is at capacity", () => {
  const result = publicRegistrationState({
    viewer: "member",
    myStatus: null,
    isPublished: true,
    isArchived: false,
    registrationOpen: true,
    isFull: true,
    hasEnded: false,
  });
  assert.equal(result, "full");
});

test("publicRegistrationState returns open for member with null status or after cancellation", () => {
  const resultNull = publicRegistrationState({
    viewer: "member",
    myStatus: null,
    isPublished: true,
    isArchived: false,
    registrationOpen: true,
    isFull: false,
    hasEnded: false,
  });
  assert.equal(resultNull, "open");

  const resultCancelled = publicRegistrationState({
    viewer: "member",
    myStatus: "cancelled",
    isPublished: true,
    isArchived: false,
    registrationOpen: true,
    isFull: false,
    hasEnded: false,
  });
  assert.equal(resultCancelled, "open");
});
