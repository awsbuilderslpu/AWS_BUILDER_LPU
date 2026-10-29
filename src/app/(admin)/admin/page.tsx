import Link from "next/link";
import { ClipboardList, UserCheck, Users } from "lucide-react";
import { requireRole } from "@/lib/auth/server";
import { roleMeta, type Role } from "@/data/roles";
import { adminCopy, adminNav } from "@/data/admin";
import { getAdminCounts } from "@/lib/admin/queries";
import { StatCard, StatCardRow } from "@/components/features/admin/kit";

export default async function AdminDashboardPage() {
  const account = await requireRole(["admin", "core"], "/admin");

  const roleKey = (account.role as Role) || "participant";
  const roleLabel = roleMeta[roleKey]?.label || roleKey;

  const isAdmin = account.role === "admin";
  const counts = isAdmin ? await getAdminCounts() : null;

  const regNavItem = adminNav.find((item) => item.key === "registrations");
  const regHref = regNavItem?.ready ? "/admin/registrations" : undefined;

  return (
    <div className="space-y-6">
      {/* Page Heading */}
      <div>
        <h1 className="text-[36px] font-bold tracking-tight text-white leading-tight">
          {adminCopy.dashboard.title}
        </h1>
        <p className="mt-1.5 text-[16px] text-muted-foreground">
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
              href={regHref}
            />
            <StatCard
              label={adminCopy.dashboard.cards.approved}
              value={counts ? counts.approved : null}
              icon={UserCheck}
              tone="green"
              href={regHref}
            />
            <StatCard
              label={adminCopy.dashboard.cards.total}
              value={counts ? counts.total : null}
              icon={Users}
              tone="blue"
              href={regHref}
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
      <div className="mt-8 rounded-2xl border border-border bg-card/60 p-6 backdrop-blur-sm md:p-8">
        <h2 className="text-xl font-semibold text-white">
          {adminCopy.dashboard.welcome(account.displayName, roleLabel)}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {adminCopy.dashboard.note}
        </p>
      </div>

      {/* Development-only Kit Demo Link */}
      {process.env.NODE_ENV !== "production" && (
        <div className="pt-2">
          <Link
            href="/admin/kit"
            className="text-sm text-muted-foreground hover:text-primary transition-colors underline underline-offset-4"
          >
            {adminCopy.dashboard.kitLink}
          </Link>
        </div>
      )}
    </div>
  );
}
