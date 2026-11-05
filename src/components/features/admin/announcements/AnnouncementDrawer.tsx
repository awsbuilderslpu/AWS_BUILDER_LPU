"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error("Please fill in both title and message.");
      return;
    }

    setLoading(true);
    try {
      if (isEditing && announcement) {
        const res = await updateAnnouncementAction(announcement.id, {
          title,
          description,
          type,
          priority,
          target_audience: targetAudience,
          href: href || undefined,
          is_published: isPublished,
        });

        if (res.ok) {
          toast.success("Notification updated successfully!");
          onSaved();
          onOpenChange(false);
        } else {
          toast.error(res.error || "Failed to update notification.");
        }
      } else {
        const res = await createAnnouncementAction({
          title,
          description,
          type,
          priority,
          target_audience: targetAudience,
          href: href || undefined,
          is_published: isPublished,
        });

        if (res.ok) {
          toast.success("Notification broadcast created successfully!");
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg overflow-y-auto border-l border-border bg-[#050b17] p-6 text-foreground"
      >
        <SheetHeader className="mb-6">
          <SheetTitle className="text-xl font-bold text-white">
            {isEditing ? "Edit Notification" : "Create Notification"}
          </SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            {isEditing
              ? "Update this notification's details and broadcast settings."
              : "Compose a new broadcast announcement to display in notification bells and feeds."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="title" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Title <span className="text-primary">*</span>
            </label>
            <input
              id="title"
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              placeholder="e.g. Workshop Registrations Open"
              required
              className="h-10 rounded-md border border-border bg-card/60 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="type" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Type
              </label>
              <select
                id="type"
                value={type}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setType(e.target.value as NotificationType)}
                className="h-10 rounded-md border border-border bg-card/80 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="announcement">Announcement</option>
                <option value="event">Event Notice</option>
                <option value="blog">Blog / Article</option>
                <option value="alert">Important Alert</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="priority" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Priority
              </label>
              <select
                id="priority"
                value={priority}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPriority(e.target.value as NotificationPriority)}
                className="h-10 rounded-md border border-border bg-card/80 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="audience" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Target Audience
            </label>
            <select
              id="audience"
              value={targetAudience}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTargetAudience(e.target.value as NotificationAudience)}
              className="h-10 rounded-md border border-border bg-card/80 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Members & Visitors</option>
              <option value="members">Approved Club Members Only</option>
              <option value="staff">Staff & Core Team Only</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="href" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Action Link (Optional)
            </label>
            <input
              id="href"
              value={href}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHref(e.target.value)}
              placeholder="e.g. /events or https://..."
              className="h-10 rounded-md border border-border bg-card/60 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="description" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Message <span className="text-primary">*</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              placeholder="Write the notification message here..."
              rows={4}
              required
              className="rounded-md border border-border bg-card/60 p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-border/80 bg-card/30 p-3.5">
            <input
              type="checkbox"
              id="is_published"
              checked={isPublished}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIsPublished(e.target.checked)}
              className="size-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
            />
            <div className="flex flex-col">
              <label htmlFor="is_published" className="text-sm font-medium text-white cursor-pointer">
                Publish immediately
              </label>
              <span className="text-xs text-muted-foreground">
                Visible to users in notification bells and lists right away.
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-end gap-3 pt-3 border-t border-border/80">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="border-border text-white hover:bg-white/5 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-primary text-black font-semibold hover:bg-primary/90 cursor-pointer"
            >
              {loading ? "Saving..." : isEditing ? "Save Changes" : "Create Notification"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
