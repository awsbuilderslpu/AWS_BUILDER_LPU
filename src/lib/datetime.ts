export const CLUB_TIMEZONE = "Asia/Kolkata";
export const IST_OFFSET_MINUTES = 330;

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

const ISO_REGEX =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/;

/**
 * Validates a YYYY-MM-DD date string without using new Date(string).
 * Checks the format, verifies it is a valid calendar day via UTC arithmetic,
 * and restricts the year between 1970 and 2100.
 */
export function isValidDateString(s: string): boolean {
  if (typeof s !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    return false;
  }
  const [yStr, mStr, dStr] = s.split("-");
  const y = Number(yStr);
  const m = Number(mStr);
  const d = Number(dStr);

  if (y < 1970 || y > 2100 || m < 1 || m > 12 || d < 1 || d > 31) {
    return false;
  }

  const utc = new Date(Date.UTC(y, m - 1, d));
  return (
    utc.getUTCFullYear() === y &&
    utc.getUTCMonth() === m - 1 &&
    utc.getUTCDate() === d
  );
}

/**
 * Validates a 24-hour HH:MM time string (00:00 to 23:59).
 */
export function isValidTimeString(s: string): boolean {
  if (typeof s !== "string") return false;
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(s);
}

/**
 * Converts IST date (YYYY-MM-DD) and time (HH:MM) to UTC ISO string.
 * Returns null if either input is invalid.
 */
export function istToIso(date: string, time: string): string | null {
  if (!isValidDateString(date) || !isValidTimeString(time)) {
    return null;
  }
  const [yStr, mStr, dStr] = date.split("-");
  const [hhStr, mmStr] = time.split(":");
  const y = Number(yStr);
  const m = Number(mStr);
  const d = Number(dStr);
  const hh = Number(hhStr);
  const mm = Number(mmStr);

  const utcMs = Date.UTC(y, m - 1, d, hh, mm) - IST_OFFSET_MINUTES * 60000;
  return new Date(utcMs).toISOString();
}

/**
 * Converts an ISO string with timezone offset/Z to IST date and time.
 * Returns null if the ISO string is invalid or has no explicit Z/offset.
 */
export function isoToIst(iso: string): { date: string; time: string } | null {
  if (typeof iso !== "string" || !ISO_REGEX.test(iso)) {
    return null;
  }
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) {
    return null;
  }

  const shifted = new Date(ms + IST_OFFSET_MINUTES * 60000);
  const yyyy = String(shifted.getUTCFullYear()).padStart(4, "0");
  const mm = String(shifted.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(shifted.getUTCDate()).padStart(2, "0");
  const hh = String(shifted.getUTCHours()).padStart(2, "0");
  const min = String(shifted.getUTCMinutes()).padStart(2, "0");

  return {
    date: `${yyyy}-${mm}-${dd}`,
    time: `${hh}:${min}`,
  };
}

/**
 * Formats a UTC ISO string in IST, e.g. "14 Nov 2026, 10:00 AM IST"
 * or "14 Nov 2026" when withTime is false. Returns "" on invalid input.
 */
export function formatIst(
  iso: string,
  opts?: { withTime?: boolean }
): string {
  const parts = isoToIst(iso);
  if (!parts) return "";

  const [yStr, mStr, dStr] = parts.date.split("-");
  const mIndex = Number(mStr) - 1;
  const day = Number(dStr);
  const dateStr = `${day} ${MONTH_NAMES[mIndex]} ${yStr}`;

  if (opts?.withTime === false) {
    return dateStr;
  }

  const [hhStr, minStr] = parts.time.split(":");
  const hours24 = Number(hhStr);
  const ampm = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;

  return `${dateStr}, ${hours12}:${minStr} ${ampm} IST`;
}

/**
 * Returns true if aIso is strictly earlier than bIso.
 * Returns false if either string is invalid.
 */
export function isBefore(aIso: string, bIso: string): boolean {
  if (!isoToIst(aIso) || !isoToIst(bIso)) {
    return false;
  }
  return Date.parse(aIso) < Date.parse(bIso);
}

