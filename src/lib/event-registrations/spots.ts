export type SpotsState = "unlimited" | "full" | "few" | "some";

export function spotsState(spotsLeft: number | null): SpotsState {
  if (spotsLeft === null) {
    return "unlimited";
  }
  if (spotsLeft <= 0) {
    return "full";
  }
  if (spotsLeft >= 1 && spotsLeft <= 5) {
    return "few";
  }
  return "some";
}
