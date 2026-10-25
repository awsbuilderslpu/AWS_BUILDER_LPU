"use client";

import * as React from "react";
import Link from "next/link";
import { Bell, Check, Calendar, Sparkles, BookOpen, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  href: string;
  unread: boolean;
  type: "event" | "announcement" | "blog";
}

const initialNotifications: NotificationItem[] = [
  {
    id: "notif-1",
    title: "AWS Cloud Practitioner Workshop",
    description: "Hands-on labs on EC2, S3 & IAM. Seats filling fast!",
    time: "2 hours ago",
    href: "/events",
    unread: true,
    type: "event",
  },
  {
    id: "notif-2",
    title: "Cloud Builder Hackathon 2026",
    description: "Registrations are officially open for all LPU students.",
    time: "Yesterday",
    href: "/events",
    unread: true,
    type: "announcement",
  },
  {
    id: "notif-3",
    title: "New Blog: AWS Beginner Guide",
    description: "Learn how to deploy your first full-stack application.",
    time: "3 days ago",
    href: "/blogs",
    unread: true,
    type: "blog",
  },
];

export function NotificationBell() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [notifications, setNotifications] =
    React.useState<NotificationItem[]>(initialNotifications);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

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

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "event":
        return <Calendar className="size-4 text-primary" />;
      case "blog":
        return <BookOpen className="size-4 text-[#2F8CFF]" />;
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

        {/* Pulse Dot indicator when unread */}
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-primary" />
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={dropdownRef}
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 top-full mt-2.5 w-[320px] sm:w-[380px] rounded-xl border border-border bg-card/95 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl z-50 animate-in fade-in-0 zoom-in-95 duration-150"
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
              notifications.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => {
                    markAsRead(item.id);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "group flex items-start gap-3 rounded-lg p-2.5 transition-colors duration-150 hover:bg-white/5",
                    item.unread && "bg-primary/[0.04]"
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
                          item.unread
                            ? "text-foreground font-semibold"
                            : "text-foreground/80"
                        )}
                      >
                        {item.title}
                      </h4>
                      {item.unread && (
                        <span className="size-1.5 shrink-0 rounded-full bg-primary" />
                      )}
                    </div>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                      {item.description}
                    </p>
                    <span className="mt-1 block font-mono text-[10.5px] text-muted-foreground/75">
                      {item.time}
                    </span>
                  </div>
                </Link>
              ))
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
