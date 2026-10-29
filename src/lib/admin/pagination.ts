export function totalPages(total: number, pageSize: number): number {
  if (total <= 0 || pageSize <= 0) {
    return 0;
  }
  return Math.ceil(total / pageSize);
}

export function getRange(
  page: number,
  pageSize: number,
  total: number
): { from: number; to: number } {
  if (total <= 0 || pageSize <= 0) {
    return { from: 0, to: 0 };
  }

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return { from, to };
}

export function getPageItems(
  page: number,
  totalPages: number
): (number | "ellipsis")[] {
  if (totalPages <= 0) {
    return [];
  }

  // 7 or fewer pages -> all numbers
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const last = totalPages;

  // page <= 4 -> [1, 2, 3, 4, 5, "ellipsis", last]
  if (page <= 4) {
    return [1, 2, 3, 4, 5, "ellipsis", last];
  }

  // page >= last - 3 -> [1, "ellipsis", last - 4, last - 3, last - 2, last - 1, last]
  if (page >= last - 3) {
    return [1, "ellipsis", last - 4, last - 3, last - 2, last - 1, last];
  }

  // else [1, "ellipsis", page - 1, page, page + 1, "ellipsis", last]
  return [1, "ellipsis", page - 1, page, page + 1, "ellipsis", last];
}

