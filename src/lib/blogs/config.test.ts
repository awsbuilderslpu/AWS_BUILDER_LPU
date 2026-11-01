import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseListParams } from "../admin/list-params";
import { blogsListConfig } from "./list-config";

describe("blogsListConfig and parseListParams", () => {
  it("uses proper defaults when raw params are empty", () => {
    const params = parseListParams({}, blogsListConfig);
    assert.equal(params.tab, "all");
    assert.equal(params.page, 1);
    assert.equal(params.pageSize, 10);
    assert.deepEqual(params.sort, { column: "publish_at", dir: "desc" });
    assert.equal(params.filters.category, null);
    assert.equal(params.q, "");
  });

  it("falls back when an invalid tab, category or sort is passed", () => {
    const params = parseListParams(
      {
        tab: "invalid_tab",
        category: "InvalidCategory",
        sort: "invalid_sort:asc",
      },
      blogsListConfig
    );
    assert.equal(params.tab, "all");
    assert.equal(params.filters.category, null);
    assert.deepEqual(params.sort, { column: "publish_at", dir: "desc" });
  });

  it("accepts page size 25, while 50 falls back to default 10", () => {
    const params25 = parseListParams({ pageSize: "25" }, blogsListConfig);
    assert.equal(params25.pageSize, 25);

    const params50 = parseListParams({ pageSize: "50" }, blogsListConfig);
    assert.equal(params50.pageSize, 10);
  });

  it("accepts 'title:asc' and rejects 'email:asc' falling back to default", () => {
    const paramsValid = parseListParams({ sort: "title:asc" }, blogsListConfig);
    assert.deepEqual(paramsValid.sort, { column: "title", dir: "asc" });

    const paramsInvalid = parseListParams({ sort: "email:asc" }, blogsListConfig);
    assert.deepEqual(paramsInvalid.sort, { column: "publish_at", dir: "desc" });
  });
});

