"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  useState,
  useRef,
  useCallback,
  useTransition,
} from "react";
import {
  parseListParams,
  toSearchParams,
  type ListConfig,
  type ListParams,
} from "./list-params";

export function useListState(config: ListConfig) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const params = parseListParams(searchParams, config);
  const [queryText, setQueryTextState] = useState<string>(params.q);
  const [prevQ, setPrevQ] = useState<string>(params.q);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync local query text when searchParams change externally (Reset, Back button)
  // Uses React's recommended render-phase state adjustment pattern
  if (params.q !== prevQ) {
    setPrevQ(params.q);
    setQueryTextState(params.q);
  }

  const pushParams = useCallback(
    (nextParams: ListParams) => {
      startTransition(() => {
        const qs = toSearchParams(nextParams, config).toString();
        router.replace(pathname + (qs ? `?${qs}` : ""), { scroll: false });
      });
    },
    [config, pathname, router]
  );

  const setQueryText = useCallback(
    (text: string) => {
      setQueryTextState(text);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        if (text !== params.q) {
          pushParams({
            ...params,
            q: text,
            page: 1,
          });
        }
      }, 300);
    },
    [params, pushParams]
  );

  const setTab = useCallback(
    (tab: string) => {
      pushParams({
        ...params,
        tab,
        page: 1,
      });
    },
    [params, pushParams]
  );

  const setFilter = useCallback(
    (key: string, value: string | null) => {
      pushParams({
        ...params,
        filters: {
          ...params.filters,
          [key]: value,
        },
        page: 1,
      });
    },
    [params, pushParams]
  );

  const setDate = useCallback(
    (key: string, value: string | null) => {
      pushParams({
        ...params,
        dates: {
          ...params.dates,
          [key]: value,
        },
        page: 1,
      });
    },
    [params, pushParams]
  );

  const setSort = useCallback(
    (sort: { column: string; dir: "asc" | "desc" }) => {
      pushParams({
        ...params,
        sort,
        page: 1,
      });
    },
    [params, pushParams]
  );

  const setPage = useCallback(
    (page: number) => {
      pushParams({
        ...params,
        page,
      });
    },
    [params, pushParams]
  );

  const setPageSize = useCallback(
    (pageSize: number) => {
      pushParams({
        ...params,
        pageSize,
        page: 1,
      });
    },
    [params, pushParams]
  );

  const reset = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setQueryTextState("");
    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });
  }, [pathname, router]);

  const isDefault =
    toSearchParams(params, config).toString() === "" && queryText === "";

  return {
    params,
    queryText,
    setQueryText,
    setTab,
    setFilter,
    setDate,
    setSort,
    setPage,
    setPageSize,
    reset,
    isPending,
    isDefault,
  };
}
