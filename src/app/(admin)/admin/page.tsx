import { requireRole } from "@/lib/auth/server";
import { roleMeta, type Role } from "@/data/roles";
import { adminCopy } from "@/data/admin";

export default async function AdminDashboardPage() {
  const account = await requireRole(["admin", "core"], "/admin");

  const roleKey = (account.role as Role) || "participant";
  const roleLabel = roleMeta[roleKey]?.label || roleKey;

  return (
    <div className="space-y-6">
      {/* Page Heading */}
      <div>
        <h1 className="text-[36px] font-bold tracking-tight text-white">
          {adminCopy.dashboard.title}
        </h1>
        <p className="mt-1.5 text-[16px] text-muted-foreground">
          {adminCopy.dashboard.subtitle}
        </p>
      </div>

      {/* Overview Welcome Card */}
      <div className="mt-8 rounded-2xl border border-border bg-card/60 p-6 backdrop-blur-sm md:p-8">
        <h2 className="text-xl font-semibold text-white">
          {adminCopy.dashboard.welcome(account.displayName, roleLabel)}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {adminCopy.dashboard.note}
        </p>
      </div>
    </div>
  );
}

