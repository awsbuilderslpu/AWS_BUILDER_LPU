export interface CsvColumn<T> {
  header: string;
  value: (row: T) => string | number | boolean | null | undefined;
}

function escapeCsvField(val: string | number | boolean | null | undefined): string {
  if (val === null || val === undefined) {
    return "";
  }

  let str = String(val);

  // OWASP formula-injection protection:
  // Prepend single quote if first character is =, +, -, @, tab (\t), or carriage return (\r)
  if (str.length > 0) {
    const firstChar = str[0];
    if (
      firstChar === "=" ||
      firstChar === "+" ||
      firstChar === "-" ||
      firstChar === "@" ||
      firstChar === "\t" ||
      firstChar === "\r"
    ) {
      str = "'" + str;
    }
  }

  // If the field contains a comma, double quote, CR, or LF, wrap in quotes and double internal quotes
  if (
    str.includes('"') ||
    str.includes(",") ||
    str.includes("\r") ||
    str.includes("\n")
  ) {
    str = `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

/**
 * Converts tabular rows to CSV string format with \r\n line endings.
 * Includes OWASP formula injection protection.
 * Contains no byte-order mark (BOM).
 */
export function toCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const headerRow = columns.map((c) => escapeCsvField(c.header)).join(",");

  if (rows.length === 0) {
    return headerRow;
  }

  const dataRows = rows.map((row) =>
    columns.map((c) => escapeCsvField(c.value(row))).join(",")
  );

  return [headerRow, ...dataRows].join("\r\n");
}

/**
 * Triggers a client-side download of CSV content with UTF-8 BOM.
 * Safe filename sanitization restricts name to alphanumeric characters, dash, and underscore.
 */
export function downloadCsv(filename: string, csv: string): void {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  const cleanName = filename.replace(/[^a-zA-Z0-9_-]/g, "");
  const safeFilename = `${cleanName || "export"}.csv`;
  const UTF8_BOM = "\uFEFF";
  const blob = new Blob([UTF8_BOM + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", safeFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

