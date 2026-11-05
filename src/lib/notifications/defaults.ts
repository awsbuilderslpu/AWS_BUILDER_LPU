import type { AnnouncementItem } from "./types";

export const defaultAnnouncements: AnnouncementItem[] = [
  {
    id: "notif-1",
    title: "AWS Cloud Practitioner Workshop",
    description: "Hands-on labs on EC2, S3 & IAM. Seats filling fast!",
    type: "event",
    href: "/events",
    target_audience: "all",
    priority: "normal",
    is_published: true,
    author_name: "Staff",
    created_at: "2026-11-04T12:00:00.000Z",
    updated_at: "2026-11-04T12:00:00.000Z",
  },
  {
    id: "notif-2",
    title: "Cloud Builder Hackathon 2026",
    description: "Registrations are officially open for all LPU students.",
    type: "announcement",
    href: "/events",
    target_audience: "all",
    priority: "high",
    is_published: true,
    author_name: "Admin",
    created_at: "2026-11-03T10:00:00.000Z",
    updated_at: "2026-11-03T10:00:00.000Z",
  },
  {
    id: "notif-3",
    title: "New Blog: AWS Beginner Guide",
    description: "Learn how to deploy your first full-stack application.",
    type: "blog",
    href: "/blogs",
    target_audience: "all",
    priority: "normal",
    is_published: true,
    author_name: "Technical Team",
    created_at: "2026-11-02T15:30:00.000Z",
    updated_at: "2026-11-02T15:30:00.000Z",
  },
];

