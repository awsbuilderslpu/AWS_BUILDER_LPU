import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/server";
import { KitDemo } from "./KitDemo";

export const metadata: Metadata = {
  title: "Kit demo",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminKitPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  await requireRole(["admin", "core"], "/admin/kit");

  return <KitDemo />;
}

