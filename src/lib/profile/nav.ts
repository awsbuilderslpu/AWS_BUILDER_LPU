export interface ProfileNavItem {
  label: string;
  href: string;
  soon?: boolean;
}

export function isSoon(item: ProfileNavItem | null | undefined): boolean {
  return Boolean(item?.soon);
}

export function activeNavItem(
  pathname: string,
  items: readonly ProfileNavItem[]
): ProfileNavItem | null {
  if (!items || items.length === 0) {
    return null;
  }
  const exactMatch = items.find((item) => item.href === pathname);
  if (exactMatch) {
    return exactMatch;
  }
  if (pathname === "/profile" || pathname.startsWith("/profile/")) {
    // If exact match not found or pathname is "/profile", fallback to the first item
    return items[0];
  }
  return items[0];
}

