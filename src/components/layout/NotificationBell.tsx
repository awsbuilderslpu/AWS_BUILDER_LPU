"use client";

import * as React from "react";
import Link from "next/link";
import {
  Bell,
  Check,
  Calendar,
  Sparkles,
  BookOpen,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchPublicNotificationsAction } from "@/lib/notifications/actions";
import type { AnnouncementItem, NotificationType } from "@/lib/notifications/types";
import { defaultAnnouncements } from "@/lib/notifications/defaults";

export type { AnnouncementItem as NotificationItem };

export function NotificationBell() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [notifications, setNotifications] =
    React.useState<AnnouncementItem[]>(defaultAnnouncements.filter((a) => a.is_published));
  const [readIds, setReadIds] = React.useState<string[]>([]);
  const [mounted, setMounted] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  // Load read IDs from localStorage on mount
  React.useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem("read_notification_ids");
      if (stored) {
        setReadIds(JSON.parse(stored));
      }
    } catch {
      // ignore storage error
    }
  }, []);

  const refreshNotifications = React.useCallback(async () => {
    try {
      const data = await fetchPublicNotificationsAction();
      if (Array.isArray(data)) {
        setNotifications(data);
      }
    } catch {
      // ignore fetch error and retain state
    }
  }, []);

  // Fetch live notifications on mount and when dropdown opens
  React.useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications, isOpen]);

  // Refetch when window regains focus (e.g. returning from admin tab)
  React.useEffect(() => {
    const handleFocus = () => {
      refreshNotifications();
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [refreshNotifications]);

  // Handle click outside to close dropdown
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

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

  const formatRelativeTime = (isoString?: string) => {
    if (!mounted || !isoString) return "Recent";
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
        return <Calendar className="size-4 text-primary" />;
      case "blog":
        return <BookOpen className="size-4 text-[#2F8CFF]" />;
      case "alert":
        return <AlertTriangle className="size-4 text-rose-400" />;
      case "announcement":
      default:
        return <Sparkles className="size-4 text-[#9D48FA]" />;
    }
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={`Notifications (${unreadCount} unread)`}
        className={cn(
          "relative flex size-10 items-center justify-center rounded-lg border border-border bg-card/40 text-muted-foreground",
          "transition-all duration-200 hover:border-primary/50 hover:bg-card/80 hover:text-primary",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ring-offset-background cursor-pointer",
          isOpen && "border-primary/60 bg-card/80 text-primary"
        )}
      >
        <Bell className="size-5 transition-transform duration-200 hover:rotate-6" />

        {/* Unread count badge */}
        {displayCount && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-black leading-none shadow-sm animate-in zoom-in-50">
            {displayCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={dropdownRef}
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 top-full mt-2.5 w-[calc(100vw-2rem)] sm:w-[380px] max-w-[380px] rounded-xl border border-border bg-card/95 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl z-50 animate-in fade-in-0 zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/80 pb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-medium text-primary">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary cursor-pointer"
              >
                <Check className="size-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* List */}
          <div className="mt-2 divide-y divide-border/40 max-h-[320px] overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="py-8 text-center text-xs text-muted-foreground">
                No notifications right now.
              </p>
            ) : (
              notifications.map((item) => {
                const isUnread = !readIds.includes(item.id);

                const itemContent = (
                  <div
                    className={cn(
                      "group flex items-start gap-3 rounded-lg p-2.5 transition-colors duration-150 hover:bg-white/5 cursor-pointer",
                      isUnread && "bg-primary/[0.04]"
                    )}
                  >
                    {/* Icon badge */}
                    <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-background/80">
                      {getIcon(item.type)}
                    </div>

                    {/* Text */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4
                          className={cn(
                            "truncate text-[13.5px] font-medium transition-colors group-hover:text-primary",
                            isUnread
                              ? "text-foreground font-semibold"
                              : "text-foreground/80"
                          )}
                        >
                          {item.title}
                        </h4>
                        {isUnread && (
                          <span className="size-1.5 shrink-0 rounded-full bg-primary" />
                        )}
                      </div>
                      <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                        {item.description}
                      </p>
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <span className="block font-mono text-[10.5px] text-muted-foreground/75">
                          {formatRelativeTime(item.created_at)}
                        </span>
                        {item.href && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary">
                            <span>View</span>
                            <ExternalLink className="size-2.5" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );

                if (item.href) {
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => {
                        markSingleAsRead(item.id);
                        setIsOpen(false);
                      }}
                    >
                      {itemContent}
                    </Link>
                  );
                }

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      markSingleAsRead(item.id);
                    }}
                  >
                    {itemContent}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="mt-3 border-t border-border/80 pt-2.5 text-center">
            <Link
              href="/events"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary transition-colors hover:underline"
            >
              <span>Explore all community events</span>
              <ExternalLink className="size-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
