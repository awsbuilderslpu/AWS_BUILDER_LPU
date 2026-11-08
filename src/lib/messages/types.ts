export type MessageStatus = "new" | "read" | "in_progress" | "resolved" | "archived";

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  registration_number: string | null;
  university: string | null;
  subject: string;
  message: string;
  resume_path: string | null;
  status: MessageStatus;
  assigned_to: string | null;
  created_at: string;
  updated_at: string | null;
}

export const messageStatusMeta: Record<
  MessageStatus,
  { label: string; badgeClass: string; dotClass: string }
> = {
  new: {
    label: "New",
    badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    dotClass: "bg-amber-400",
  },
  read: {
    label: "Read",
    badgeClass: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    dotClass: "bg-blue-400",
  },
  in_progress: {
    label: "In Progress",
    badgeClass: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    dotClass: "bg-purple-400",
  },
  resolved: {
    label: "Resolved",
    badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    dotClass: "bg-emerald-400",
  },
  archived: {
    label: "Archived",
    badgeClass: "bg-slate-500/10 text-slate-400 border-slate-500/30",
    dotClass: "bg-slate-400",
  },
};

