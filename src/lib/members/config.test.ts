import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseListParams } from "../admin/list-params";
import { buildMembersListConfig } from "./config";

describe("members config helper", () => {
  const config = buildMembersListConfig(
    ["cse", "it", "ece"],
    ["1st Year", "2nd Year"]
  );

  it("parses defaults on empty input", () => {
    const params = parseListParams({}, config);
    assert.equal(params.page, 1);
    assert.equal(params.pageSize, 10);
    assert.equal(params.tab, "all");
    assert.deepEqual(params.sort, { column: "full_name", dir: "asc" });
    assert.equal(params.filters.department, null);
    assert.equal(params.filters.year, null);
    assert.equal(params.filters.status, null);
  });

  it("falls back on an invalid tab, department, or status", () => {
    const params = parseListParams(
      {
        tab: "superadmin",
        department: "nonexistent",
        status: "banned",
      },
      config
    );
    assert.equal(params.tab, "all");
    assert.equal(params.filters.department, null);
    assert.equal(params.filters.status, null);
  });

  it("accepts page size 50 and falls back to 10 for 100", () => {
    const valid = parseListParams({ pageSize: "50" }, config);
    assert.equal(valid.pageSize, 50);

    const invalid = parseListParams({ pageSize: "100" }, config);
    assert.equal(invalid.pageSize, 10);
  });

  it("accepts role:asc and rejects email:asc", () => {
    const valid = parseListParams({ sort: "role:asc" }, config);
    assert.deepEqual(valid.sort, { column: "role", dir: "asc" });

    const invalid = parseListParams({ sort: "email:asc" }, config);
    assert.deepEqual(invalid.sort, { column: "full_name", dir: "asc" });
  });
});
