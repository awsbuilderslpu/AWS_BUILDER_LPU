import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { toCsv, type CsvColumn } from "./csv.js";

describe("csv helper", () => {
  interface DemoItem {
    name: string | null | undefined;
    details: string;
  }

  const columns: CsvColumn<DemoItem>[] = [
    { header: "Name", value: (r) => r.name },
    { header: "Details", value: (r) => r.details },
  ];

  it("handles empty rows by returning only the header", () => {
    const csv = toCsv([], columns);
    assert.equal(csv, "Name,Details");
    assert.ok(!csv.startsWith("\uFEFF"), "toCsv must not include a BOM");
  });

  it("converts null and undefined values into empty strings", () => {
    const rows: DemoItem[] = [
      { name: null, details: "valid" },
      { name: undefined, details: "also valid" },
    ];
    const csv = toCsv(rows, columns);
    const lines = csv.split("\r\n");
    assert.equal(lines[0], "Name,Details");
    assert.equal(lines[1], ",valid");
    assert.equal(lines[2], ",also valid");
  });

  it("escapes fields containing commas, double quotes, and newlines", () => {
    const rows: DemoItem[] = [
      { name: "Smith, John", details: 'Said "Hello"' },
      { name: "Multi\nline", details: "SingleLine" },
    ];
    const csv = toCsv(rows, columns);
    assert.ok(csv.includes('"Smith, John","Said ""Hello"""'));
    assert.ok(csv.includes('"Multi\nline",SingleLine'));
  });

  it("escapes each of the OWASP formula injection prefixes (=, +, -, @, tab, cr)", () => {
    const rows: DemoItem[] = [
      { name: "=1+1", details: "equals" },
      { name: "+12345", details: "plus" },
      { name: "-50", details: "minus" },
      { name: "@username", details: "at" },
      { name: "\ttabbed", details: "tab" },
      { name: "\rcarriage", details: "cr" },
    ];
    const csv = toCsv(rows, columns);
    assert.ok(csv.includes("'=1+1,equals"));
    assert.ok(csv.includes("'+12345,plus"));
    assert.ok(csv.includes("'-50,minus"));
    assert.ok(csv.includes("'@username,at"));
    assert.ok(csv.includes("'\ttabbed,tab"));
    assert.ok(csv.includes('"\'\rcarriage",cr'));
  });

  it("does not insert UTF-8 BOM in toCsv output", () => {
    const rows: DemoItem[] = [{ name: "Alice", details: "Admin" }];
    const csv = toCsv(rows, columns);
    assert.equal(csv.charCodeAt(0) === 0xfeff, false);
  });
});
