import type { Metadata } from "next";
import Link from "next/link";
import {
  Mail,
  UserCheck,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { requireUser } from "@/lib/auth/server";
import { roleMeta, type Role } from "@/data/roles";
import { authCopy } from "@/data/auth";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "./SignOutButton";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "My Account | AWS Builder Group LPU",
  description: "View your account details and club membership status.",
};

export default async function AccountPage() {
  const account = await requireUser();

  const roleKey = (account.role as Role) || "participant";
  const roleInfo = roleMeta[roleKey] || roleMeta.participant;
  const RoleIcon = roleInfo.icon;

  const statusLabel =
    account.registrationStatus === "approved"
      ? "Approved"
      : account.registrationStatus === "rejected"
      ? "Under Revision"
      : account.registrationStatus === "archived"
      ? "Archived"
      : "Pending Review";

  const isApproved = account.registrationStatus === "approved";

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            {authCopy.account.title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {authCopy.account.subtitle}
          </p>
        </div>
        <div>
          <SignOutButton />
        </div>
      </div>

      {/* User Summary Card */}
      <div className="mt-8 rounded-2xl border border-border bg-card/60 p-6 sm:p-8 backdrop-blur-sm">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <Avatar name={account.displayName || "Member"} size={72} />
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-bold text-white">
                  {account.displayName}
                </h2>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-semibold ring-1",
                    roleInfo.tone.bg,
                    roleInfo.tone.text,
                    roleInfo.tone.ring
                  )}
                >
                  <RoleIcon className="size-3.5" />
                  {roleInfo.label}
                </span>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-xs font-medium",
                    account.isActive
                      ? "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30"
                      : "bg-zinc-500/10 text-zinc-400 ring-1 ring-zinc-500/30"
                  )}
                >
                  {account.isActive
                    ? authCopy.account.activeStatus
                    : authCopy.account.inactiveStatus}
                </span>
              </div>
              <p className="mt-1.5 flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="size-4 shrink-0 text-muted-foreground" />
                <span>{account.email}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        {/* Role & Privileges Card */}
        <div className="rounded-xl border border-border bg-card/40 p-6">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex size-10 items-center justify-center rounded-lg border",
                roleInfo.tone.border,
                roleInfo.tone.bg
              )}
            >
              <RoleIcon className={cn("size-5", roleInfo.tone.text)} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                {authCopy.account.roleLabel}
              </h3>
              <p className="text-lg font-semibold text-white">
                {roleInfo.label}
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {roleInfo.description}
          </p>
        </div>

        {/* Registration Status Card */}
        <div className="rounded-xl border border-border bg-card/40 p-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg border border-primary/30 bg-primary/10">
              {isApproved ? (
                <UserCheck className="size-5 text-emerald-400" />
              ) : (
                <Clock className="size-5 text-primary" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                {authCopy.account.statusLabel}
              </h3>
              <p className="text-lg font-semibold text-white">
                {statusLabel}
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {isApproved
              ? "Your student registration has been reviewed and verified by the club administration."
              : "Your registration is currently under review by club administration. You can browse events and content while review is pending."}
          </p>
        </div>

        {/* Profile Completeness Card */}
        <div className="rounded-xl border border-border bg-card/40 p-6 sm:col-span-2">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg border border-border bg-white/5">
                <CheckCircle2
                  className={cn(
                    "size-5",
                    account.profileComplete
                      ? "text-emerald-400"
                      : "text-amber-400"
                  )}
                />
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  {authCopy.account.profileLabel}
                </h3>
                <p className="text-lg font-semibold text-white">
                  {account.profileComplete
                    ? authCopy.account.profileComplete
                    : authCopy.account.profileIncomplete}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold",
                  account.profileComplete
                    ? "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30"
                    : "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/30"
                )}
              >
                {account.profileComplete ? "Ready" : "Action Needed"}
              </span>
              {!account.profileComplete && (
                <Button asChild variant="primary" size="sm">
                  <Link href="?auth=complete" scroll={false}>
                    {authCopy.account.incompleteCta}
                  </Link>
                </Button>
              )}
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {!account.profileComplete
              ? authCopy.account.incompleteNotice
              : authCopy.account.profileHint}
          </p>
        </div>
      </div>
    </div>
  );
}
