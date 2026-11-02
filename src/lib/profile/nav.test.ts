import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { activeNavItem, isSoon, type ProfileNavItem } from "./nav";

describe("profile nav", () => {
  const items: ProfileNavItem[] = [
    { label: "Profile", href: "/profile", soon: false },
    { label: "My Events", href: "/profile/events", soon: true },
    { label: "My Blogs", href: "/profile/blogs", soon: true },
    { label: "Settings", href: "/profile/settings", soon: true },
  ];

  it("activeNavItem returns exact match for /profile", () => {
    const active = activeNavItem("/profile", items);
    assert.deepEqual(active, items[0]);
  });

  it("activeNavItem matches exact href when it exists", () => {
    const active = activeNavItem("/profile/events", items);
    assert.deepEqual(active, items[1]);
  });

  it("activeNavItem returns the first item for an unknown path", () => {
    const active = activeNavItem("/unknown/path", items);
    assert.deepEqual(active, items[0]);
  });

  it("activeNavItem returns null for empty items array", () => {
    assert.equal(activeNavItem("/profile", []), null);
  });

  it("isSoon accurately checks the soon flag of an item", () => {
    assert.equal(isSoon(items[0]), false);
    assert.equal(isSoon(items[1]), true);
    assert.equal(isSoon(undefined), false);
    assert.equal(isSoon(null), false);
  });
});

