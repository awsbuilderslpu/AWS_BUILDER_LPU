import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/server";
import { AdminShell } from "@/components/features/admin/AdminShell";

export const metadata: Metadata = {
  title: {
    default: "Admin",
    template: "%s · Admin",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const account = await requireRole(["admin", "core"], "/admin");

  return (
    <div className="relative z-10 min-h-screen">
      <AdminShell account={account}>{children}</AdminShell>
    </div>
  );
}

