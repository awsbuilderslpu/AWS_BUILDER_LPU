import {
  isValidDateString,
  istToIso,
  isoToIst,
} from "../datetime";

export function addDays(dateString: string, n: number): string {
  const [yStr, mStr, dStr] = dateString.split("-");
  const y = Number(yStr);
  const m = Number(mStr);
  const d = Number(dStr);

  const utc = new Date(Date.UTC(y, m - 1, d + n));
  const outY = utc.getUTCFullYear();
  const outM = String(utc.getUTCMonth() + 1).padStart(2, "0");
  const outD = String(utc.getUTCDate()).padStart(2, "0");

  return `${outY}-${outM}-${outD}`;
}

export function istDayRange(
  from: string | null,
  to: string | null
): { fromIso: string | null; toExclusiveIso: string | null } {
  const fromValid = typeof from === "string" && isValidDateString(from);
  const toValid = typeof to === "string" && isValidDateString(to);

  if (fromValid && toValid && from! > to!) {
    return { fromIso: null, toExclusiveIso: null };
  }

  const fromIso = fromValid ? istToIso(from!, "00:00") : null;
  const toExclusiveIso = toValid ? istToIso(addDays(to!, 1), "00:00") : null;

  return { fromIso, toExclusiveIso };
}

export function istTodayStart(nowMs: number): string {
  const iso = new Date(nowMs).toISOString();
  const ist = isoToIst(iso);
  if (!ist) {
    return "";
  }
  return istToIso(ist.date, "00:00") ?? "";
}

