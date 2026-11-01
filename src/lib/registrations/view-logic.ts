import type { AppRole, RegistrationStatus } from "../auth/account";
import { allowedActions, defaultApprovalRole } from "./transitions";
import type { ReviewAction, ApprovableRole } from "./types";

export function rowName(row: {
  fullName?: string | null;
  email?: string | null;
}): string {
  const fn = row.fullName?.trim();
  if (fn) return fn;
  const em = row.email?.trim();
  if (em) return em;
  return "(no name)";
}

export function commonActions(
  statuses: RegistrationStatus[]
): ReviewAction[] {
  if (statuses.length === 0) {
    return [];
  }

  const firstAllowed = allowedActions(statuses[0]);
  return firstAllowed.filter((action) =>
    statuses.every((s) => allowedActions(s).includes(action))
  );
}

export function clampPage(
  page: number,
  pageSize: number,
  total: number
): number {
  if (total <= 0 || page < 1) {
    return 1;
  }
  const maxPage = Math.max(1, Math.ceil(total / pageSize));
  if (page > maxPage) {
    return maxPage;
  }
  return Math.floor(page);
}

export function differingRoleCount(
  requested: AppRole[],
  chosen: AppRole
): number {
  return requested.filter((r) => r !== chosen).length;
}

export function hasAdminRequest(requested: AppRole[]): boolean {
  return requested.includes("admin");
}

export function initialApprovalRole(requested: AppRole[]): ApprovableRole {
  if (requested.length !== 1) {
    return "student";
  }
  const single = requested[0];
  if (single === "core") {
    return "student";
  }
  return defaultApprovalRole(single);
}

export interface SummaryResultInput {
  id: string;
  ok: boolean;
  status?: string;
  error?: string;
  email?: "sent" | "failed" | "skipped" | "not_configured";
}

export interface SummarizedResults {
  okCount: number;
  failedCount: number;
  errorCodes: string[];
  email: {
    sent: number;
    failed: number;
    notConfigured: number;
    skipped: number;
  };
}

export function summarizeResults(
  results: SummaryResultInput[]
): SummarizedResults {
  let okCount = 0;
  let failedCount = 0;
  const emailStats = {
    sent: 0,
    failed: 0,
    notConfigured: 0,
    skipped: 0,
  };

  const errorFrequency = new Map<string, { count: number; firstIndex: number }>();

  results.forEach((res, index) => {
    if (res.ok) {
      okCount++;
      if (res.email === "sent") emailStats.sent++;
      else if (res.email === "failed") emailStats.failed++;
      else if (res.email === "not_configured") emailStats.notConfigured++;
      else if (res.email === "skipped") emailStats.skipped++;
    } else {
      failedCount++;
      if (res.error) {
        const existing = errorFrequency.get(res.error);
        if (existing) {
          existing.count++;
        } else {
          errorFrequency.set(res.error, { count: 1, firstIndex: index });
        }
      }
    }
  });

  const errorCodes = Array.from(errorFrequency.entries())
    .sort((a, b) => {
      if (b[1].count !== a[1].count) {
        return b[1].count - a[1].count; // higher frequency first
      }
      return a[1].firstIndex - b[1].firstIndex; // tie-breaker: first appearance
    })
    .map(([code]) => code);

  return {
    okCount,
    failedCount,
    errorCodes,
    email: emailStats,
  };
}

export function tabToLabel(
  tab: string,
  tabs: string[],
  labels: Record<string, string>
): string {
  if (tabs.includes(tab) && labels[tab]) {
    return labels[tab];
  }
  const defaultTab = tabs[0];
  return labels[defaultTab] ?? defaultTab ?? "";
}

export function labelToTab(
  label: string,
  tabs: string[],
  labels: Record<string, string>
): string {
  const normalized = label.trim().toLowerCase();
  for (const t of tabs) {
    if (
      (labels[t] && labels[t].trim().toLowerCase() === normalized) ||
      t.toLowerCase() === normalized
    ) {
      return t;
    }
  }
  return tabs[0] ?? "";
}

