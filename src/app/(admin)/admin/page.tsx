import { connection } from "next/server";
import { ClipboardList, UserCheck, Users } from "lucide-react";
import { requireRole } from "@/lib/auth/server";
import { roleMeta, type Role } from "@/data/roles";
import { adminCopy, adminNav } from "@/data/admin";
import { getAdminCounts } from "@/lib/admin/queries";
import { StatCard, StatCardRow } from "@/components/features/admin/kit";

export default async function AdminDashboardPage() {
  await connection();
  const account = await requireRole(["admin", "core"], "/admin");

  const roleKey = (account.role as Role) || "participant";
  const roleLabel = roleMeta[roleKey]?.label || roleKey;

  const isAdmin = account.role === "admin";
  const counts = isAdmin ? await getAdminCounts() : null;

  const regNavItem = adminNav.find((item) => item.key === "registrations");
  const pendingHref = regNavItem?.ready
    ? "/admin/registrations?tab=pending"
    : undefined;
  const approvedHref = regNavItem?.ready
    ? "/admin/registrations?tab=approved"
    : undefined;
  const totalHref = regNavItem?.ready ? "/admin/registrations" : undefined;

  return (
    <div className="space-y-6">
      {/* Page Heading */}
      <div>
        <h1 className="text-2xl sm:text-[36px] font-bold tracking-tight text-white leading-tight">
          {adminCopy.dashboard.title}
        </h1>
        <p className="mt-1 sm:mt-1.5 text-sm sm:text-[16px] text-muted-foreground">
          {adminCopy.dashboard.subtitle}
        </p>
      </div>

      {/* Admin Stat Cards (Admin role only) */}
      {isAdmin && (
        <div>
          <StatCardRow>
            <StatCard
              label={adminCopy.dashboard.cards.pending}
              value={counts ? counts.pending : null}
              icon={ClipboardList}
              tone="orange"
              href={pendingHref}
            />
            <StatCard
              label={adminCopy.dashboard.cards.approved}
              value={counts ? counts.approved : null}
              icon={UserCheck}
              tone="green"
              href={approvedHref}
            />
            <StatCard
              label={adminCopy.dashboard.cards.total}
              value={counts ? counts.total : null}
              icon={Users}
              tone="blue"
              href={totalHref}
            />
          </StatCardRow>
          {counts === null && (
            <p className="mt-2 text-sm text-muted-foreground">
              {adminCopy.dashboard.countsUnavailable}
            </p>
          )}
        </div>
      )}

      {/* Overview Welcome Card (16a) */}
      <div className="mt-6 sm:mt-8 rounded-2xl border border-border bg-card/60 p-4 sm:p-6 md:p-8 backdrop-blur-sm">
        <h2 className="text-lg sm:text-xl font-semibold text-white">
          {adminCopy.dashboard.welcome(account.displayName, roleLabel)}
        </h2>
        <p className="mt-2.5 sm:mt-3 text-sm leading-relaxed text-muted-foreground">
          {adminCopy.dashboard.note}
        </p>
      </div>
    </div>
  );
}
