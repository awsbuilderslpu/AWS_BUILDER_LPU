import * as React from "react";
import Link from "next/link";
import { Mail, ArrowRight, MessageSquareCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DashboardMessageItem } from "@/lib/admin/queries";

interface RecentMessagesCardProps {
  messages: DashboardMessageItem[];
}

function timeAgo(isoDate: string) {
  try {
    const ms = Date.parse(isoDate);
    if (Number.isNaN(ms)) return "";
    const diffSec = Math.floor((Date.now() - ms) / 1000);
    if (diffSec < 60) return "just now";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays}d ago`;
    return new Date(ms).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

export function RecentMessagesCard({ messages }: RecentMessagesCardProps) {
  return (
    <div className="rounded-2xl border border-border/80 bg-card/60 backdrop-blur-sm overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 p-4 sm:p-5">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg border border-violet/30 bg-violet/10 text-violet">
            <Mail className="size-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">
              Contact & Inquiries
            </h3>
            <p className="text-xs text-muted-foreground">
              Incoming questions from prospective members and partners
            </p>
          </div>
        </div>

        <Link
          href="/admin/messages"
          className="group inline-flex items-center gap-1.5 text-xs font-medium text-violet hover:text-violet/80 transition-colors"
        >
          View all
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* Messages List or Empty State */}
      {messages.length === 0 ? (
        <div className="p-8 text-center flex flex-col items-center justify-center">
          <div className="size-10 rounded-full border border-border bg-card/40 flex items-center justify-center text-muted-foreground mb-3">
            <MessageSquareCheck className="size-5" />
          </div>
          <p className="text-sm font-medium text-foreground">Inbox is clear</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">
            No pending questions or contact form submissions.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border/40">
          {messages.map((msg) => {
            const isNew = msg.status === "new";
            const ago = timeAgo(msg.createdAt);

            return (
              <Link
                key={msg.id}
                href="/admin/messages"
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 hover:bg-white/[0.02] transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[13.5px] font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                      {msg.name}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      ({msg.email})
                    </span>
                    {isNew && (
                      <span className="inline-flex size-2 rounded-full bg-violet animate-pulse" />
                    )}
                  </div>

                  <div className="mt-1">
                    <span className="text-xs font-medium text-foreground/90 mr-2">
                      {msg.subject}:
                    </span>
                    <span className="text-xs text-muted-foreground line-clamp-1">
                      {msg.message}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-mono capitalize",
                      isNew
                        ? "border-violet/50 bg-violet/15 text-violet"
                        : msg.status === "in_progress"
                          ? "border-accent/50 bg-accent/15 text-accent"
                          : "border-border text-muted-foreground"
                    )}
                  >
                    {msg.status.replace("_", " ")}
                  </span>
                  {ago && (
                    <span className="text-[11px] text-muted-foreground/70 font-mono">
                      {ago}
                    </span>
                  )}
                  <ArrowRight className="size-3.5 text-muted-foreground/50 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

