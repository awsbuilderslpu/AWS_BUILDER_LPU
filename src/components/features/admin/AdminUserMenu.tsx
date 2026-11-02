"use client";

import { AccountMenu } from "@/components/layout/AccountMenu";
import type { AccountSummary } from "@/lib/auth/account";

export interface AdminUserMenuProps {
  account: AccountSummary;
}

export function AdminUserMenu({ account }: AdminUserMenuProps) {
  return <AccountMenu account={account} showViewSite />;
}
