import { sanitizeSearchTerm } from "./search";

export interface ListConfig {
  tabs?: string[]; // first is the default
  filters?: Record<string, string[]>; // allowed values per filter key
  dateKeys?: string[];
  sorts: string[]; // each "column:asc" or "column:desc"
  defaultSort: string;
  pageSizes?: number[]; // default [10, 25, 50]
}

export interface ListParams {
  q: string;
  tab: string | null;
  page: number;
  pageSize: number;
  sort: { column: string; dir: "asc" | "desc" };
  filters: Record<string, string | null>;
  dates: Record<string, string | null>;
}

function getRawValue(raw: unknown, key: string): string | undefined {
  if (!raw || typeof raw !== "object") {
    return undefined;
  }
  if ("get" in raw && typeof (raw as { get: unknown }).get === "function") {
    const val = (raw as { get: (name: string) => string | null }).get(key);
    return val ?? undefined;
  }
  const record = raw as Record<string, unknown>;
  const val = record[key];
  if (Array.isArray(val)) {
    return val.length > 0 && val[0] !== undefined ? String(val[0]) : undefined;
  }
  if (typeof val === "string") {
    return val;
  }
  if (typeof val === "number") {
    return String(val);
  }
  return undefined;
}

function isValidCalendarDate(val: unknown): boolean {
  if (typeof val !== "string") return false;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(val);
  if (!match) return false;
  const y = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const d = parseInt(match[3], 10);
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  const dt = new Date(y, m - 1, d);
  return (
    dt.getFullYear() === y &&
    dt.getMonth() === m - 1 &&
    dt.getDate() === d
  );
}

export function parseListParams(
  raw:
    | Record<string, string | string[] | undefined>
    | URLSearchParams
    | { get: (name: string) => string | null },
  config: ListConfig
): ListParams {
  // q
  const rawQ = getRawValue(raw, "q");
  const q = sanitizeSearchTerm(rawQ);

  // tab
  const tabs = config.tabs && config.tabs.length > 0 ? config.tabs : [];
  const defaultTab = tabs.length > 0 ? tabs[0] : null;
  const rawTab = getRawValue(raw, "tab");
  const tab = rawTab && tabs.includes(rawTab) ? rawTab : defaultTab;

  // page sizes & pageSize
  const pageSizes =
    config.pageSizes && config.pageSizes.length > 0
      ? config.pageSizes
      : [10, 25, 50];
  const defaultPageSize = pageSizes[0];
  const rawPageSize = getRawValue(raw, "pageSize");
  const parsedPageSize =
    rawPageSize !== undefined ? parseInt(rawPageSize, 10) : NaN;
  const pageSize =
    !Number.isNaN(parsedPageSize) && pageSizes.includes(parsedPageSize)
      ? parsedPageSize
      : defaultPageSize;

  // page
  const rawPage = getRawValue(raw, "page");
  const parsedPage = rawPage !== undefined ? parseInt(rawPage, 10) : NaN;
  const page =
    Number.isInteger(parsedPage) && parsedPage >= 1 && parsedPage <= 10000
      ? parsedPage
      : 1;

  // sort
  const rawSort = getRawValue(raw, "sort");
  const sortStr =
    rawSort && config.sorts.includes(rawSort)
      ? rawSort
      : config.defaultSort;
  const [col, dirStr] = sortStr.split(":");
  const dir: "asc" | "desc" = dirStr === "desc" ? "desc" : "asc";
  const sort = { column: col, dir };

  // filters
  const filters: Record<string, string | null> = {};
  if (config.filters) {
    for (const [key, allowedValues] of Object.entries(config.filters)) {
      const rawVal = getRawValue(raw, key);
      filters[key] =
        rawVal && allowedValues.includes(rawVal) ? rawVal : null;
    }
  }

  // dates
  const dates: Record<string, string | null> = {};
  if (config.dateKeys) {
    for (const key of config.dateKeys) {
      const rawDate = getRawValue(raw, key);
      dates[key] = isValidCalendarDate(rawDate) ? rawDate! : null;
    }
  }

  return {
    q,
    tab,
    page,
    pageSize,
    sort,
    filters,
    dates,
  };
}

export function toSearchParams(
  params: ListParams,
  config: ListConfig
): URLSearchParams {
  const searchParams = new URLSearchParams();

  if (params.q) {
    searchParams.set("q", params.q);
  }

  const defaultTab =
    config.tabs && config.tabs.length > 0 ? config.tabs[0] : null;
  if (params.tab && params.tab !== defaultTab) {
    searchParams.set("tab", params.tab);
  }

  if (params.page > 1) {
    searchParams.set("page", String(params.page));
  }

  const pageSizes =
    config.pageSizes && config.pageSizes.length > 0
      ? config.pageSizes
      : [10, 25, 50];
  const defaultPageSize = pageSizes[0];
  if (params.pageSize !== defaultPageSize) {
    searchParams.set("pageSize", String(params.pageSize));
  }

  const currentSortStr = `${params.sort.column}:${params.sort.dir}`;
  if (currentSortStr !== config.defaultSort) {
    searchParams.set("sort", currentSortStr);
  }

  if (params.filters) {
    for (const [k, v] of Object.entries(params.filters)) {
      if (v !== null && v !== "") {
        searchParams.set(k, v);
      }
    }
  }

  if (params.dates) {
    for (const [k, v] of Object.entries(params.dates)) {
      if (v !== null && v !== "") {
        searchParams.set(k, v);
      }
    }
  }

  return searchParams;
}
