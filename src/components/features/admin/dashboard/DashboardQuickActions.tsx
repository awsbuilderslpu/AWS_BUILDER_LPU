import * as React from "react";
import Link from "next/link";
import {
  ClipboardList,
  CalendarPlus,
  PenSquare,
  Megaphone,
  FolderGit2,
  Mail,
  Users,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardQuickActionsProps {
  isAdmin: boolean;
  pendingCount?: number;
  newMessagesCount?: number;
}

export function DashboardQuickActions({
  isAdmin,
  pendingCount = 0,
  newMessagesCount = 0,
}: DashboardQuickActionsProps) {
  const actions = [
    ...(isAdmin
      ? [
        {
          label: "Review Registrations",
          href: "/admin/registrations?tab=pending",
          icon: ClipboardList,
          badge: pendingCount > 0 ? `${pendingCount} pending` : undefined,
          badgeTone: "orange",
          description: "Review pending membership applications",
        },
        {
          label: "Manage Members",
          href: "/admin/members",
          icon: Users,
          description: "View and edit member roles",
        },
      ]
      : []),
    {
      label: "Schedule Event",
      href: "/admin/events",
      icon: CalendarPlus,
      description: "Host workshops, hackathons & talks",
    },
    {
      label: "Write Blog",
      href: "/admin/blogs",
      icon: PenSquare,
      description: "Publish articles and tutorials",
    },
    {
      label: "Broadcast Alert",
      href: "/admin/announcements",
      icon: Megaphone,
      description: "Send alerts to club members",
    },
    {
      label: "Club Projects",
      href: "/admin/projects",
      icon: FolderGit2,
      description: "Showcase community repositories",
    },
    {
      label: "Contact Inquiries",
      href: "/admin/messages",
      icon: Mail,
      badge: newMessagesCount > 0 ? `${newMessagesCount} new` : undefined,
      badgeTone: "violet",
      description: "Respond to public inquiries",
    },
    {
      label: "View Public Site",
      href: "/",
      icon: ExternalLink,
      description: "Preview live AWS Builder site",
      isExternal: true,
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-primary" />
          Quick Actions & Operations
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.label}
              href={action.href}
              className={cn(
                "group relative flex flex-col justify-between rounded-xl border border-border/70 bg-card/40 p-3.5 sm:p-4 transition-all duration-200",
                "hover:border-primary/40 hover:bg-card/80 hover:shadow-[0_4px_20px_-4px_rgba(255,153,0,0.12)] hover:-translate-y-0.5"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex size-9 items-center justify-center rounded-lg border border-border/80 bg-muted/80 text-foreground/80 transition-colors group-hover:border-primary/40 group-hover:bg-primary/10 group-hover:text-primary dark:bg-[#050B18] dark:text-muted-foreground">
                  <Icon className="size-4" />
                </div>
                {action.badge && (
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider",
                      action.badgeTone === "orange"
                        ? "border-primary/50 bg-primary/15 text-primary shadow-[0_0_8px_rgba(255,153,0,0.3)] animate-pulse"
                        : "border-violet/50 bg-violet/15 text-violet"
                    )}
                  >
                    {action.badge}
                  </span>
                )}
              </div>

              <div className="mt-3">
                <span className="text-[13.5px] font-semibold text-foreground group-hover:text-primary transition-colors block">
                  {action.label}
                </span>
                <span className="text-[11.5px] text-muted-foreground line-clamp-1 mt-0.5">
                  {action.description}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

