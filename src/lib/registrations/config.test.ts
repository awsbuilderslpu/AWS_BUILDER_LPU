import test, { describe } from "node:test";
import assert from "node:assert/strict";
import { parseListParams } from "../admin/list-params";
import { buildRegistrationsListConfig } from "./config";

describe("registrations config helper", () => {
  const sampleProgrammes = ["B.Tech", "BCA", "MCA"];
  const sampleYears = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
  const config = buildRegistrationsListConfig(sampleProgrammes, sampleYears);

  test("defaults are parsed correctly on empty input", () => {
    const params = parseListParams({}, config);
    assert.equal(params.tab, "all");
    assert.equal(params.page, 1);
    assert.equal(params.pageSize, 10);
    assert.deepEqual(params.sort, { column: "applied_at", dir: "desc" });
    assert.equal(params.filters.programme, null);
    assert.equal(params.filters.year, null);
    assert.equal(params.dates.from, null);
    assert.equal(params.dates.to, null);
  });

  test("invalid tab or programme falls back to defaults", () => {
    const params = parseListParams(
      {
        tab: "unknown_tab",
        programme: "NonExistentCourse",
        year: "2nd Year",
      },
      config
    );
    assert.equal(params.tab, "all");
    assert.equal(params.filters.programme, null);
    assert.equal(params.filters.year, "2nd Year");
  });

  test("a page size of 50 falls back to 10", () => {
    const params = parseListParams({ pageSize: "50" }, config);
    assert.equal(params.pageSize, 10);

    const valid25 = parseListParams({ pageSize: "25" }, config);
    assert.equal(valid25.pageSize, 25);
  });

  test("full_name:asc is accepted and email:asc is rejected", () => {
    const accepted = parseListParams({ sort: "full_name:asc" }, config);
    assert.deepEqual(accepted.sort, { column: "full_name", dir: "asc" });

    const rejected = parseListParams({ sort: "email:asc" }, config);
    assert.deepEqual(rejected.sort, { column: "applied_at", dir: "desc" });
  });
});

