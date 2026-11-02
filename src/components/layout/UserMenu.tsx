"use client";

import { AccountMenu } from "@/components/layout/AccountMenu";
import type { AccountSummary } from "@/lib/auth/account";

export interface UserMenuProps {
  account: AccountSummary;
  className?: string;
}

export function UserMenu({ account, className }: UserMenuProps) {
  return <AccountMenu account={account} className={className} />;
}
