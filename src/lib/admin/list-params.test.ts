import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  parseListParams,
  toSearchParams,
  type ListConfig,
} from "./list-params.js";

describe("list-params helper", () => {
  const config: ListConfig = {
    tabs: ["all", "pending", "approved"],
    filters: {
      role: ["admin", "member", "student"],
      status: ["active", "inactive"],
    },
    dateKeys: ["from", "to"],
    sorts: ["created_at:desc", "created_at:asc", "name:asc"],
    defaultSort: "created_at:desc",
    pageSizes: [10, 25, 50],
  };

  it("falls back to defaults on invalid page, pageSize, sort, tab, filter, and invalid date (e.g. 2025-02-31)", () => {
    const raw = {
      page: "not-a-number",
      pageSize: "999",
      sort: "hacked_col:asc",
      tab: "unknown_tab",
      role: "superuser",
      from: "2025-02-31", // invalid calendar date
      to: "not-a-date",
    };

    const parsed = parseListParams(raw, config);

    assert.equal(parsed.page, 1);
    assert.equal(parsed.pageSize, 10);
    assert.deepEqual(parsed.sort, { column: "created_at", dir: "desc" });
    assert.equal(parsed.tab, "all");
    assert.equal(parsed.filters.role, null);
    assert.equal(parsed.dates.from, null);
    assert.equal(parsed.dates.to, null);
  });

  it("handles out of bounds page numbers by falling back to 1", () => {
    assert.equal(parseListParams({ page: "-5" }, config).page, 1);
    assert.equal(parseListParams({ page: "0" }, config).page, 1);
    assert.equal(parseListParams({ page: "10001" }, config).page, 1);
    assert.equal(parseListParams({ page: "42" }, config).page, 42);
  });

  it("handles array inputs by using the first element", () => {
    const raw = {
      q: ["Alice", "Bob"],
      tab: ["pending", "all"],
      page: ["3", "1"],
      pageSize: ["25", "10"],
      sort: ["name:asc", "created_at:desc"],
      role: ["admin", "member"],
      from: ["2025-03-15", "2025-03-20"],
    };

    const parsed = parseListParams(raw, config);

    assert.equal(parsed.q, "Alice");
    assert.equal(parsed.tab, "pending");
    assert.equal(parsed.page, 3);
    assert.equal(parsed.pageSize, 25);
    assert.deepEqual(parsed.sort, { column: "name", dir: "asc" });
    assert.equal(parsed.filters.role, "admin");
    assert.equal(parsed.dates.from, "2025-03-15");
  });

  it("sanitises search query q", () => {
    const parsed = parseListParams({ q: 'user<script>,"test"*' }, config);
    assert.equal(parsed.q, "userscripttest");
  });

  it("omits defaults in round trip through toSearchParams", () => {
    // When everything is at default
    const parsedDefaults = parseListParams({}, config);
    const paramsAtDefault = toSearchParams(parsedDefaults, config);
    assert.equal(paramsAtDefault.toString(), "");

    // When some fields are changed
    const custom = {
      q: "demo",
      tab: "approved",
      page: "2",
      pageSize: "50",
      sort: "name:asc",
      role: "admin",
      from: "2025-01-01",
    };
    const parsedCustom = parseListParams(custom, config);
    const sp = toSearchParams(parsedCustom, config);

    assert.equal(sp.get("q"), "demo");
    assert.equal(sp.get("tab"), "approved");
    assert.equal(sp.get("page"), "2");
    assert.equal(sp.get("pageSize"), "50");
    assert.equal(sp.get("sort"), "name:asc");
    assert.equal(sp.get("role"), "admin");
    assert.equal(sp.get("from"), "2025-01-01");
    assert.equal(sp.get("status"), null);
    assert.equal(sp.get("to"), null);

    // Parsing back from the URLSearchParams
    const roundTrip = parseListParams(sp, config);
    assert.equal(roundTrip.q, "demo");
    assert.equal(roundTrip.tab, "approved");
    assert.equal(roundTrip.page, 2);
    assert.equal(roundTrip.pageSize, 50);
    assert.deepEqual(roundTrip.sort, { column: "name", dir: "asc" });
    assert.equal(roundTrip.filters.role, "admin");
    assert.equal(roundTrip.dates.from, "2025-01-01");
  });

  it("never throws when passed non-object or nullish inputs", () => {
    assert.doesNotThrow(() => {
      parseListParams(null as unknown as Record<string, string>, config);
      parseListParams(undefined as unknown as Record<string, string>, config);
      parseListParams("foo" as unknown as Record<string, string>, config);
    });
  });
});

