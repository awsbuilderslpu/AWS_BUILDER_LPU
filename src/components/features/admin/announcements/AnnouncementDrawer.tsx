"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  createAnnouncementAction,
  updateAnnouncementAction,
} from "@/lib/notifications/actions";
import type {
  AnnouncementItem,
  NotificationType,
  NotificationPriority,
  NotificationAudience,
} from "@/lib/notifications/types";

interface AnnouncementDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  announcement?: AnnouncementItem | null;
  onSaved: () => void;
}

export function AnnouncementDrawer({
  open,
  onOpenChange,
  announcement,
  onSaved,
}: AnnouncementDrawerProps) {
  const isEditing = Boolean(announcement);
  const [loading, setLoading] = React.useState(false);

  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [type, setType] = React.useState<NotificationType>("announcement");
  const [priority, setPriority] = React.useState<NotificationPriority>("normal");
  const [targetAudience, setTargetAudience] =
    React.useState<NotificationAudience>("all");
  const [href, setHref] = React.useState("");
  const [isPublished, setIsPublished] = React.useState(true);

  React.useEffect(() => {
    if (announcement) {
      setTitle(announcement.title);
      setDescription(announcement.description);
      setType(announcement.type);
      setPriority(announcement.priority);
      setTargetAudience(announcement.target_audience);
      setHref(announcement.href || "");
      setIsPublished(announcement.is_published);
    } else {
      setTitle("");
      setDescription("");
      setType("announcement");
      setPriority("normal");
      setTargetAudience("all");
      setHref("");
      setIsPublished(true);
    }
  }, [announcement, open]);

  const handleSaveWithStatus = async (targetPublishState: boolean) => {
    if (!title.trim() || !description.trim()) {
      toast.error("Please fill in both title and message.");
      return;
    }

    setLoading(true);
    try {
      if (isEditing && announcement) {
        const res = await updateAnnouncementAction(announcement.id, {
          title: title.trim(),
          description: description.trim(),
          type,
          priority,
          target_audience: targetAudience,
          href: href.trim() || undefined,
          is_published: targetPublishState,
        });

        if (res.ok) {
          toast.success(
            targetPublishState
              ? "Notification updated & published!"
              : "Notification updated as draft."
          );
          onSaved();
          onOpenChange(false);
        } else {
          toast.error(res.error || "Failed to update notification.");
        }
      } else {
        const res = await createAnnouncementAction({
          title: title.trim(),
          description: description.trim(),
          type,
          priority,
          target_audience: targetAudience,
          href: href.trim() || undefined,
          is_published: targetPublishState,
        });

        if (res.ok) {
          toast.success(
            targetPublishState
              ? "Notification broadcast created & published!"
              : "Notification saved as draft."
          );
          onSaved();
          onOpenChange(false);
        } else {
          toast.error(res.error || "Failed to create notification.");
        }
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSaveWithStatus(isPublished);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-xl max-h-[90vh] flex flex-col p-0 gap-0 border border-slate-800 bg-[#0A0E17] text-slate-100 shadow-2xl rounded-2xl overflow-hidden">
        <DialogHeader className="p-5 sm:p-6 border-b border-slate-800/80 bg-[#0B101C]/80 shrink-0 text-left pr-12">
          <DialogTitle className="text-xl font-bold text-white">
            {isEditing ? "Edit Notification" : "Create Notification"}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-slate-400 mt-1">
            {isEditing
              ? "Update this notification's details and broadcast settings."
              : "Compose a new broadcast announcement to display in notification bells and feeds."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 [scrollbar-width:thin]">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="title" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Title <span className="text-[#FF9900]">*</span>
              </label>
              <input
                id="title"
                value={title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                placeholder="e.g. Workshop Registrations Open"
                required
                className="h-10 rounded-lg border border-slate-700 bg-slate-900/60 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#FF9900]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="type" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Type
                </label>
                <select
                  id="type"
                  value={type}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setType(e.target.value as NotificationType)}
                  className="h-10 rounded-lg border border-slate-700 bg-slate-900/80 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#FF9900]"
                >
                  <option value="announcement">Announcement</option>
                  <option value="event">Event Notice</option>
                  <option value="blog">Blog / Article</option>
                  <option value="alert">Important Alert</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="priority" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Priority
                </label>
                <select
                  id="priority"
                  value={priority}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPriority(e.target.value as NotificationPriority)}
                  className="h-10 rounded-lg border border-slate-700 bg-slate-900/80 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#FF9900]"
                >
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="audience" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Target Audience
              </label>
              <select
                id="audience"
                value={targetAudience}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTargetAudience(e.target.value as NotificationAudience)}
                className="h-10 rounded-lg border border-slate-700 bg-slate-900/80 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#FF9900]"
              >
                <option value="all">All Members & Visitors</option>
                <option value="members">Approved Club Members Only</option>
                <option value="staff">Staff & Core Team Only</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="href" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Action Link (Optional)
              </label>
              <input
                id="href"
                value={href}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHref(e.target.value)}
                placeholder="e.g. /events or https://..."
                className="h-10 rounded-lg border border-slate-700 bg-slate-900/60 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#FF9900]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="description" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Message <span className="text-[#FF9900]">*</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                placeholder="Write the notification message here..."
                rows={4}
                required
                className="rounded-lg border border-slate-700 bg-slate-900/60 p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#FF9900]"
              />
            </div>

            {/* Publication Status Selector */}
            <div className="flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Publication Status
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsPublished(true)}
                  className={`flex flex-col items-center justify-center rounded-lg border p-3 text-center transition-all cursor-pointer ${
                    isPublished
                      ? "border-emerald-500/60 bg-emerald-500/15 text-white shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                      : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  <span className="text-sm font-semibold flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                    Published
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5">
                    Live in notification bell & feeds
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsPublished(false)}
                  className={`flex flex-col items-center justify-center rounded-lg border p-3 text-center transition-all cursor-pointer ${
                    !isPublished
                      ? "border-amber-500/60 bg-amber-500/15 text-white shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                      : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  <span className="text-sm font-semibold flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-amber-400" />
                    Draft
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5">
                    Saved in admin only (hidden)
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 p-4 sm:p-5 border-t border-slate-800/80 bg-[#0B101C]/90 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer text-xs"
            >
              Cancel
            </Button>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={() => handleSaveWithStatus(false)}
                className="border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700 hover:text-white cursor-pointer text-xs"
              >
                {loading ? "Saving..." : "Save as Draft"}
              </Button>

              <Button
                type="button"
                disabled={loading}
                onClick={() => handleSaveWithStatus(true)}
                className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold cursor-pointer text-xs shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              >
                {loading
                  ? "Saving..."
                  : isEditing
                  ? "Publish & Save"
                  : "Publish Now"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
