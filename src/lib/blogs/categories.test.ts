import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { blogCategories } from "./categories";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

describe("blog categories", () => {
  it("has exactly ten unique non-empty entries", () => {
    assert.equal(blogCategories.length, 10);
    const unique = new Set(blogCategories);
    assert.equal(unique.size, 10);
    for (const c of blogCategories) {
      assert.ok(c.length > 0, `Category should not be empty: ${c}`);
    }
  });

  it("every category appears in the 011_blogs.sql constraint line", () => {
    const migrationPath = join(
      __dirname,
      "../../../supabase/migrations/011_blogs.sql"
    );
    const sql = readFileSync(migrationPath, "utf8");
    // Find the blogs_category_values constraint line
    const match = sql.match(/blogs_category_values[^\n]+/);
    assert.ok(match, "blogs_category_values constraint not found in migration");
    const constraintLine = match[0];
    for (const cat of blogCategories) {
      assert.ok(
        constraintLine.includes(cat),
        `Category "${cat}" not found in 011_blogs.sql constraint`
      );
    }
  });
});

