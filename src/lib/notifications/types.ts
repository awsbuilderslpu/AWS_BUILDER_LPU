export type NotificationType = "announcement" | "event" | "blog" | "alert";
export type NotificationPriority = "normal" | "high" | "urgent";
export type NotificationAudience = "all" | "members" | "staff";

export interface AnnouncementItem {
  id: string;
  title: string;
  description: string;
  type: NotificationType;
  href?: string | null;
  target_audience: NotificationAudience;
  priority: NotificationPriority;
  is_published: boolean;
  created_by?: string | null;
  author_name?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AnnouncementFormData {
  title: string;
  description: string;
  type: NotificationType;
  href?: string;
  target_audience: NotificationAudience;
  priority: NotificationPriority;
  is_published: boolean;
}

