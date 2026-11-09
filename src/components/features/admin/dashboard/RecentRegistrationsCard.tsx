import * as React from "react";
import Link from "next/link";
import { Users, ArrowRight, UserCheck, Clock } from "lucide-react";
import { UserCell } from "@/components/features/admin/kit/UserCell";
import { RoleBadge } from "@/components/features/admin/kit/RoleBadge";
import { StatusBadge, statusTones } from "@/components/features/admin/kit/StatusBadge";
import { formatIst } from "@/lib/datetime";
import type { Role } from "@/data/roles";
import type { DashboardRecentRegistration } from "@/lib/admin/queries";

interface RecentRegistrationsCardProps {
  rows: DashboardRecentRegistration[];
}

export function RecentRegistrationsCard({ rows }: RecentRegistrationsCardProps) {
  return (
    <div className="rounded-2xl border border-border/80 bg-card/60 backdrop-blur-sm overflow-hidden flex flex-col">
      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-border/60 p-4 sm:p-5">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
            <Users className="size-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">
              Recent Registrations
            </h3>
            <p className="text-xs text-muted-foreground">
              Latest students and builders applying to join the chapter
            </p>
          </div>
        </div>

        <Link
          href="/admin/registrations"
          className="group inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary-hover transition-colors"
        >
          View all
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* Rows or Empty State */}
      {rows.length === 0 ? (
        <div className="p-8 text-center flex flex-col items-center justify-center">
          <div className="size-10 rounded-full border border-border bg-card/40 flex items-center justify-center text-muted-foreground mb-3">
            <UserCheck className="size-5" />
          </div>
          <p className="text-sm font-medium text-foreground">No recent registrations</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">
            When new students submit their membership application, they will appear here.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border/40">
          {rows.map((row) => {
            const formattedDate = row.appliedAt
              ? formatIst(row.appliedAt, { withTime: false })
              : "-";
            const tone = statusTones[row.status] ?? "muted";

            return (
              <div
                key={row.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <UserCell
                    name={row.fullName || row.email || "Applicant"}
                    src={row.avatarUrl || undefined}
                    secondary={
                      [
                        row.registrationNumber,
                        row.department,
                        row.studyYear ? `Year ${row.studyYear}` : null,
                      ]
                        .filter(Boolean)
                        .join(" · ") || row.email
                    }
                  />
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 ml-11 sm:ml-0">
                  <div className="hidden sm:block">
                    <RoleBadge role={row.requestedRole as Role} />
                  </div>

                  <StatusBadge tone={tone} className="capitalize text-xs h-6 px-2.5">
                    {row.status}
                  </StatusBadge>

                  <span className="hidden md:inline-flex items-center gap-1 text-xs text-muted-foreground/80 font-mono">
                    <Clock className="size-3 text-muted-foreground/60" />
                    {formattedDate}
                  </span>

                  <Link
                    href={`/admin/registrations?q=${encodeURIComponent(row.email || row.fullName)}`}
                    className="inline-flex items-center justify-center size-7 rounded-lg border border-border bg-card/60 text-muted-foreground hover:border-primary/40 hover:bg-primary/10 hover:text-primary transition-all text-xs"
                    title="Review registration"
                  >
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

