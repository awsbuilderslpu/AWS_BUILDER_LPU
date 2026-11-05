import type { Metadata } from "next";
import { requireStaff } from "@/lib/auth/server";
import { fetchAnnouncementsAction } from "@/lib/notifications/actions";
import { AnnouncementsView } from "@/components/features/admin/announcements/AnnouncementsView";

export const metadata: Metadata = {
  title: "Announcements & Notifications",
};

export default async function AdminAnnouncementsPage() {
  await requireStaff("/admin/announcements");
  const announcements = await fetchAnnouncementsAction();

  return <AnnouncementsView initialAnnouncements={announcements} />;
}

