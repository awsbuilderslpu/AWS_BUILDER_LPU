import type { MyStatus } from "./types";

export type PublicRegistrationState =
  | "sign-in"
  | "not-member"
  | "ended"
  | "registered"
  | "attended"
  | "closed"
  | "full"
  | "open";

export interface PublicRegistrationStateParams {
  viewer: "anonymous" | "signed-in-not-member" | "member";
  myStatus: MyStatus;
  isPublished: boolean;
  isArchived: boolean;
  registrationOpen: boolean;
  isFull: boolean;
  hasEnded: boolean;
}

export function publicRegistrationState(
  params: PublicRegistrationStateParams
): PublicRegistrationState {
  if (params.viewer === "anonymous") {
    return "sign-in";
  }
  if (params.viewer === "signed-in-not-member") {
    return "not-member";
  }
  if (params.hasEnded) {
    return "ended";
  }
  if (params.myStatus === "registered") {
    return "registered";
  }
  if (params.myStatus === "attended") {
    return "attended";
  }
  if (!params.isPublished || params.isArchived || !params.registrationOpen) {
    return "closed";
  }
  if (params.isFull) {
    return "full";
  }
  return "open";
}
