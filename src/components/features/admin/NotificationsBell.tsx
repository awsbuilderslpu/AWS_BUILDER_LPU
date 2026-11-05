"use client";

import * as React from "react";
import Link from "next/link";
import {
  Bell,
  Check,
  Calendar,
  Megaphone,
  BookOpen,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { fetchPublicNotificationsAction } from "@/lib/notifications/actions";
import type { AnnouncementItem, NotificationType } from "@/lib/notifications/types";

export function NotificationsBell() {
  const [open, setOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<AnnouncementItem[]>([]);
  const [readIds, setReadIds] = React.useState<string[]>([]);

  // Load read IDs from localStorage on mount
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem("read_notification_ids");
      if (stored) {
        setReadIds(JSON.parse(stored));
      }
    } catch {
      // ignore storage error
    }
  }, []);

  // Fetch live notifications
  React.useEffect(() => {
    fetchPublicNotificationsAction().then((data) => {
      setNotifications(data);
    });
  }, [open]);

  const unreadItems = notifications.filter((n) => !readIds.includes(n.id));
  const unreadCount = unreadItems.length;
  const displayCount = unreadCount > 9 ? "9+" : unreadCount > 0 ? String(unreadCount) : null;

  const markAllAsRead = () => {
    const allIds = notifications.map((n) => n.id);
    const updated = Array.from(new Set([...readIds, ...allIds]));
    setReadIds(updated);
    try {
      localStorage.setItem("read_notification_ids", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const markSingleAsRead = (id: string) => {
    if (!readIds.includes(id)) {
      const updated = [...readIds, id];
      setReadIds(updated);
      try {
        localStorage.setItem("read_notification_ids", JSON.stringify(updated));
      } catch {
        // ignore
      }
    }
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const diff = Date.now() - new Date(isoString).getTime();
      const mins = Math.floor(diff / (1000 * 60));
      if (mins < 5) return "Just now";
      if (mins < 60) return `${mins}m ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      if (days === 1) return "Yesterday";
      if (days < 7) return `${days}d ago`;
      return new Date(isoString).toLocaleDateString();
    } catch {
      return "Recent";
    }
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case "event":
        return <Calendar className="size-4 text-amber-500" />;
      case "blog":
        return <BookOpen className="size-4 text-sky-400" />;
      case "alert":
        return <AlertTriangle className="size-4 text-rose-400" />;
      case "announcement":
      default:
        return <Megaphone className="size-4 text-emerald-400" />;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex size-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background cursor-pointer"
        >
          <Bell className="size-5" />
          {displayCount && (
            <span
              aria-hidden="true"
              className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-black shadow-[0_0_8px_rgba(255,153,0,0.5)] animate-in zoom-in-50"
            >
              {displayCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-80 sm:w-96 rounded-2xl border border-border bg-[#060c18]/95 p-0 shadow-2xl backdrop-blur-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/80 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">Notifications</span>
            {unreadCount > 0 && (
              <span className="rounded-full bg-primary/20 px-2 py-0.2 text-[11px] font-medium text-primary">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-primary transition-colors cursor-pointer"
            >
              <Check className="size-3.5" />
              Mark all read
            </button>
          )}
        </div>

        {/* Notifications list */}
        <div className="max-h-[360px] overflow-y-auto divide-y divide-border/40 [scrollbar-width:thin]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Bell className="size-8 text-muted-foreground/40 mb-2" />
              <p className="text-sm font-medium text-white">No notifications yet</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                New announcements and alerts will appear here.
              </p>
            </div>
          ) : (
            notifications.map((item) => {
              const isUnread = !readIds.includes(item.id);

              const content = (
                <div
                  onClick={() => markSingleAsRead(item.id)}
                  className={cn(
                    "group relative flex items-start gap-3 p-3.5 transition-colors hover:bg-white/[0.03] cursor-pointer",
                    isUnread && "bg-white/[0.02]"
                  )}
                >
                  <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/80 bg-card/60">
                    {getIcon(item.type)}
                  </div>

                  <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={cn(
                          "text-xs font-semibold truncate transition-colors",
                          isUnread ? "text-white" : "text-slate-300"
                        )}
                      >
                        {item.title}
                      </span>
                      <span className="text-[10px] text-muted-foreground shrink-0 font-mono">
                        {formatRelativeTime(item.created_at)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    {item.href && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary mt-1">
                        View details
                        <ExternalLink className="size-2.5" />
                      </span>
                    )}
                  </div>

                  {isUnread && (
                    <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary shadow-[0_0_6px_rgba(255,153,0,0.8)]" />
                  )}
                </div>
              );

              if (item.href) {
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => {
                      markSingleAsRead(item.id);
                      setOpen(false);
                    }}
                  >
                    {content}
                  </Link>
                );
              }

              return <div key={item.id}>{content}</div>;
            })
          )}
        </div>

        {/* Footer: Link to admin management */}
        <div className="border-t border-border/80 bg-[#040812] px-4 py-2.5 text-center">
          <Link
            href="/admin/announcements"
            onClick={() => setOpen(false)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
          >
            <span>Manage all announcements</span>
            <ChevronRight className="size-3.5" />
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
