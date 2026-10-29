import type { Metadata } from "next";
import { headers } from "next/headers";
import { requireRole } from "@/lib/auth/server";
import { AdminShell } from "@/components/features/admin/AdminShell";

export const instant = false;

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
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") || "/admin";
  const account = await requireRole(["admin", "core"], pathname);

  return (
    <div className="relative z-10 min-h-screen">
      <AdminShell account={account}>{children}</AdminShell>
    </div>
  );
}

