import type { EventLifecycle } from "./types";

export interface EventLifecycleInput {
  startsAt?: string | null;
  endsAt?: string | null;
  archivedAt?: string | null;
}

/**
 * Computes event lifecycle status dynamically from start, end, and archive timestamps.
 * Unparseable or invalid timestamps evaluate to "completed" so they never appear bookable.
 */
export function eventLifecycle(
  event: EventLifecycleInput,
  nowMs: number
): EventLifecycle {
  if (event.archivedAt) {
    return "archived";
  }

  if (!event.startsAt || !event.endsAt) {
    return "completed";
  }

  const startMs = Date.parse(event.startsAt);
  const endMs = Date.parse(event.endsAt);

  if (Number.isNaN(startMs) || Number.isNaN(endMs) || endMs <= startMs) {
    return "completed";
  }

  if (nowMs < startMs) {
    return "upcoming";
  }

  if (nowMs >= startMs && nowMs < endMs) {
    return "ongoing";
  }

  return "completed";
}

export interface RegistrationOpenInput {
  isPublished?: boolean | null;
  archivedAt?: string | null;
  registrationEnabled?: boolean | null;
  registrationDeadline?: string | null;
  startsAt?: string | null;
}

/**
 * Determines whether registration is currently open for an event.
 * True only when published, not archived, registration is enabled, and now < (deadline ?? startsAt).
 */
export function registrationOpen(
  event: RegistrationOpenInput,
  nowMs: number
): boolean {
  if (!event.isPublished) {
    return false;
  }

  if (event.archivedAt) {
    return false;
  }

  if (!event.registrationEnabled) {
    return false;
  }

  const cutoffIso = event.registrationDeadline ?? event.startsAt;
  if (!cutoffIso) {
    return false;
  }

  const cutoffMs = Date.parse(cutoffIso);
  if (Number.isNaN(cutoffMs)) {
    return false;
  }

  return nowMs < cutoffMs;
}

