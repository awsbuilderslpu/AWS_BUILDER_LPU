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

export function formatDob(dob?: string): string {
  if (!dob || !/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
    return "";
  }
  const [y, m, d] = dob.split("-").map(Number);
  const month = MONTH_NAMES[m - 1] ?? "";
  if (!month) {
    return dob;
  }
  return `${d} ${month} ${y}`;
}
