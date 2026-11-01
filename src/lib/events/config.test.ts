import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildEventsListConfig } from "./config";
import { parseListParams } from "../admin/list-params";

describe("events config helper", () => {
  const categories = ["workshop", "hackathon", "talk"];
  const config = buildEventsListConfig(categories);

  it("parses defaults on empty input", () => {
    const params = parseListParams({}, config);
    assert.equal(params.tab, "all");
    assert.equal(params.pageSize, 10);
    assert.equal(params.page, 1);
    assert.deepEqual(params.sort, { column: "starts_at", dir: "desc" });
    assert.equal(params.filters.category, null);
    assert.equal(params.filters.publish, null);
  });

  it("falls back when given an invalid tab, category, or publish value", () => {
    const params = parseListParams(
      {
        tab: "invalid_tab",
        category: "invalid_category",
        publish: "invalid_publish",
      },
      config
    );
    assert.equal(params.tab, "all");
    assert.equal(params.filters.category, null);
    assert.equal(params.filters.publish, null);
  });

  it("page size 25 is accepted and 50 falls back to 10", () => {
    const params25 = parseListParams({ pageSize: "25" }, config);
    assert.equal(params25.pageSize, 25);

    const params50 = parseListParams({ pageSize: "50" }, config);
    assert.equal(params50.pageSize, 10);
  });

  it("'title:asc' is accepted and 'email:asc' is rejected", () => {
    const validSort = parseListParams({ sort: "title:asc" }, config);
    assert.deepEqual(validSort.sort, { column: "title", dir: "asc" });

    const invalidSort = parseListParams({ sort: "email:asc" }, config);
    assert.deepEqual(invalidSort.sort, { column: "starts_at", dir: "desc" });
  });
});

