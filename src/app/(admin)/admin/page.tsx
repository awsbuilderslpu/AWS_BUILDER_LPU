import { connection } from "next/server";
import {
  ClipboardList,
  UserCheck,
  CalendarDays,
  Mail,
  FolderGit2,
  Sparkles,
} from "lucide-react";
import { requireRole } from "@/lib/auth/server";
import { adminCopy, adminNav } from "@/data/admin";
import { getDashboardData } from "@/lib/admin/queries";
import { StatCard, StatCardRow } from "@/components/features/admin/kit";
import { RoleBadge } from "@/components/features/admin/kit/RoleBadge";
import {
  DashboardQuickActions,
  RecentRegistrationsCard,
  UpcomingEventsCard,
  RecentMessagesCard,
  ChapterPulseCard,
} from "@/components/features/admin/dashboard";

export default async function AdminDashboardPage() {
  await connection();
  const account = await requireRole(["administrator", "admin"], "/admin");

  const isAdmin = account.role === "administrator" || account.role === "admin";

  const dashboardData = await getDashboardData(isAdmin);
  const counts = dashboardData.counts;

  const regNavItem = adminNav.find((item) => item.key === "registrations");
  const pendingHref = regNavItem?.ready
    ? "/admin/registrations?tab=pending"
    : undefined;
  const approvedHref = regNavItem?.ready
    ? "/admin/registrations?tab=approved"
    : undefined;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Page Heading & Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-card via-card/80 to-background p-5 sm:p-7 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-primary font-semibold uppercase tracking-wider">
              <span className="size-2 rounded-full bg-primary animate-pulse" />
              AWS Builder Group · LPU Chapter Console
            </div>
            <h1 className="mt-1.5 text-2xl sm:text-3xl font-bold tracking-tight text-foreground leading-tight">
              Welcome back, {account.displayName || "Builder"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {adminCopy.dashboard.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
            <RoleBadge role={account.role || "participant"} />
            <div className="hidden sm:flex items-center gap-2 rounded-xl border border-border/70 bg-muted px-3 py-1.5 text-xs font-mono text-muted-foreground">
              <span className="size-1.5 rounded-full bg-emerald-400" />
              ap-south-1
            </div>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-primary/10 blur-3xl" />
      </div>

      {/* Primary Metrics Grid */}
      <div>
        <StatCardRow className="grid-cols-2 lg:grid-cols-4">
          {isAdmin ? (
            <>
              <StatCard
                label={adminCopy.dashboard.cards.pending}
                value={counts.pending}
                icon={ClipboardList}
                tone="orange"
                href={pendingHref}
                hint={counts.pending > 0 ? "Requires review" : "Up to date"}
              />
              <StatCard
                label={adminCopy.dashboard.cards.approved}
                value={counts.approved}
                icon={UserCheck}
                tone="green"
                href={approvedHref}
                hint="Active club members"
              />
              <StatCard
                label="Upcoming Events"
                value={counts.upcomingEvents}
                icon={CalendarDays}
                tone="blue"
                href="/admin/events"
                hint="Workshops & sessions"
              />
              <StatCard
                label="Contact Inquiries"
                value={counts.newMessages}
                icon={Mail}
                tone="violet"
                href="/admin/messages"
                hint={counts.newMessages > 0 ? `${counts.newMessages} unread` : "All read"}
              />
            </>
          ) : (
            <>
              <StatCard
                label="Upcoming Events"
                value={counts.upcomingEvents}
                icon={CalendarDays}
                tone="blue"
                href="/admin/events"
                hint="Scheduled club events"
              />
              <StatCard
                label="Total Events"
                value={counts.totalEvents}
                icon={Sparkles}
                tone="green"
                href="/admin/events"
                hint="All organized events"
              />
              <StatCard
                label="Contact Inquiries"
                value={counts.newMessages}
                icon={Mail}
                tone="violet"
                href="/admin/messages"
                hint="Inbound queries"
              />
              <StatCard
                label="Club Projects"
                value={counts.totalProjects}
                icon={FolderGit2}
                tone="orange"
                href="/admin/projects"
                hint="Community projects"
              />
            </>
          )}
        </StatCardRow>
      </div>

      {/* Quick Actions & Navigation Bar */}
      <DashboardQuickActions
        isAdmin={isAdmin}
        pendingCount={counts.pending}
        newMessagesCount={counts.newMessages}
      />

      {/* Main 2-Column Content Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (Main Feed & Data) */}
        <div className="lg:col-span-7 space-y-6">
          {isAdmin && (
            <RecentRegistrationsCard rows={dashboardData.recentRegistrations} />
          )}

          <RecentMessagesCard messages={dashboardData.recentMessages} />
        </div>

        {/* Right Column (Events & System Health) */}
        <div className="lg:col-span-5 space-y-6">
          <UpcomingEventsCard events={dashboardData.upcomingEvents} />

          <ChapterPulseCard />
        </div>
      </div>
    </div>
  );
}
