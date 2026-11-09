"use client";

import * as React from "react";
import {
  Mail,
  Search,
  CheckCircle2,
  Clock,
  Trash2,
  Eye,
  FileText,
  RotateCcw,
  MoreVertical,
  Reply,
  Inbox,
} from "lucide-react";
import { AdminPageHeader } from "@/components/features/admin/kit/AdminPageHeader";
import { StatCard } from "@/components/features/admin/kit/StatCard";
import { StatCardRow } from "@/components/features/admin/kit/StatCardRow";
import { ConfirmDialog } from "@/components/features/admin/kit/ConfirmDialog";
import { EmptyState } from "@/components/features/admin/kit/EmptyState";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { ContactMessage, MessageStatus } from "@/lib/messages/types";
import { messageStatusMeta } from "@/lib/messages/types";
import {
  updateContactMessageStatusAction,
  deleteContactMessageAction,
} from "@/lib/messages/actions";
import { MessageDetailDrawer } from "./MessageDetailDrawer";

export interface MessagesViewProps {
  initialMessages: ContactMessage[];
}

export function MessagesView({ initialMessages }: MessagesViewProps) {
  const [messages, setMessages] = React.useState<ContactMessage[]>(initialMessages);
  const [search, setSearch] = React.useState("");
  const [selectedStatus, setSelectedStatus] = React.useState<string>("all");
  const [selectedTopic, setSelectedTopic] = React.useState<string>("all");

  // Selected message for details
  const [detailMessage, setDetailMessage] = React.useState<ContactMessage | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);

  // Deletion modal
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [messageToDelete, setMessageToDelete] = React.useState<ContactMessage | null>(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);

  // Sync if initialMessages changes
  React.useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  // Derived counts
  const counts = React.useMemo(() => {
    return {
      total: messages.length,
      new: messages.filter((m) => m.status === "new").length,
      inProgress: messages.filter((m) => m.status === "in_progress").length,
      resolved: messages.filter((m) => m.status === "resolved").length,
    };
  }, [messages]);

  // Derived unique topics
  const topics = React.useMemo(() => {
    const set = new Set<string>();
    messages.forEach((m) => {
      if (m.subject) set.add(m.subject);
    });
    return Array.from(set);
  }, [messages]);

  // Filtered messages
  const filteredMessages = React.useMemo(() => {
    return messages.filter((item) => {
      // 1. Status Filter
      if (selectedStatus !== "all" && item.status !== selectedStatus) {
        return false;
      }

      // 2. Topic Filter
      if (selectedTopic !== "all" && item.subject !== selectedTopic) {
        return false;
      }

      // 3. Search Filter
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesEmail = item.email.toLowerCase().includes(query);
        const matchesPhone = item.phone?.toLowerCase().includes(query) ?? false;
        const matchesReg = item.registration_number?.toLowerCase().includes(query) ?? false;
        const matchesUniversity = item.university?.toLowerCase().includes(query) ?? false;
        const matchesSubject = item.subject.toLowerCase().includes(query);
        const matchesMessage = item.message.toLowerCase().includes(query);

        return (
          matchesName ||
          matchesEmail ||
          matchesPhone ||
          matchesReg ||
          matchesUniversity ||
          matchesSubject ||
          matchesMessage
        );
      }

      return true;
    });
  }, [messages, selectedStatus, selectedTopic, search]);

  const handleOpenDetail = (message: ContactMessage) => {
    setDetailMessage(message);
    setDetailOpen(true);

    // If status is 'new', auto-mark as 'read'
    if (message.status === "new") {
      handleStatusChange(message, "read");
    }
  };

  const handleStatusChange = async (message: ContactMessage, nextStatus: MessageStatus) => {
    // Optimistic update
    setMessages((prev) =>
      prev.map((m) => (m.id === message.id ? { ...m, status: nextStatus } : m))
    );
    if (detailMessage?.id === message.id) {
      setDetailMessage((prev) => (prev ? { ...prev, status: nextStatus } : null));
    }

    try {
      const res = await updateContactMessageStatusAction(message.id, nextStatus);
      if (res.ok) {
        toast.success(`Marked as ${messageStatusMeta[nextStatus]?.label || nextStatus}`);
      } else {
        toast.error(res.error || "Failed to update status");
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDeleteRequest = (message: ContactMessage) => {
    setMessageToDelete(message);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!messageToDelete) return;
    setDeleteLoading(true);

    try {
      const res = await deleteContactMessageAction(messageToDelete.id);
      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== messageToDelete.id));
        if (detailMessage?.id === messageToDelete.id) {
          setDetailOpen(false);
          setDetailMessage(null);
        }
        toast.success("Message deleted successfully");
      } else {
        toast.error(res.error || "Failed to delete message");
      }
    } catch {
      toast.error("Failed to delete message");
    } finally {
      setDeleteLoading(false);
      setDeleteConfirmOpen(false);
      setMessageToDelete(null);
    }
  };

  const handleClearFilters = () => {
    setSearch("");
    setSelectedStatus("all");
    setSelectedTopic("all");
  };

  const hasActiveFilters = search.trim() !== "" || selectedStatus !== "all" || selectedTopic !== "all";

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8 max-w-[1440px] mx-auto select-none">
      {/* 1. Header */}
      <AdminPageHeader
        title="Contact Messages"
        subtitle="Review, organize, and respond to inquiries, feedback, and collaboration requests."
      />

      {/* 2. Stat Cards */}
      <StatCardRow>
        <StatCard
          label="Total Messages"
          value={counts.total}
          icon={Mail}
          tone="blue"
          hint="All inquiries collected"
        />
        <StatCard
          label="New Messages"
          value={counts.new}
          icon={Clock}
          tone={counts.new > 0 ? "orange" : "muted"}
          hint={counts.new > 0 ? "Requires review" : "All caught up"}
        />
        <StatCard
          label="In Progress"
          value={counts.inProgress}
          icon={Inbox}
          tone="violet"
          hint="Active discussions"
        />
        <StatCard
          label="Resolved"
          value={counts.resolved}
          icon={CheckCircle2}
          tone="green"
          hint="Answered inquiries"
        />
      </StatCardRow>

      {/* 3. Search and Filters */}
      <div className="flex flex-col gap-3 rounded-xl border border-border/80 bg-card/60 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by sender, email, reg no, subject..."
            className="w-full rounded-lg border border-border/80 bg-background/80 py-2 pl-9 pr-4 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Filter */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              aria-label="Filter by status"
              className="appearance-none rounded-lg border border-border/80 bg-background/80 px-3 py-2 pr-8 text-xs font-medium text-foreground focus:border-primary focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="new">New ({counts.new})</option>
              <option value="read">Read</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="archived">Archived</option>
            </select>
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              ▼
            </span>
          </div>

          {/* Topic Filter */}
          {topics.length > 0 && (
            <div className="relative">
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                aria-label="Filter by topic"
                className="appearance-none rounded-lg border border-border/80 bg-background/80 px-3 py-2 pr-8 text-xs font-medium text-foreground focus:border-primary focus:outline-none"
              >
                <option value="all">All Topics</option>
                {topics.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                ▼
              </span>
            </div>
          )}

          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-xs text-muted-foreground hover:text-foreground gap-1.5 h-9"
            >
              <RotateCcw className="size-3.5" />
              <span>Reset</span>
            </Button>
          )}
        </div>
      </div>

      {/* 4. Messages Table / List */}
      {filteredMessages.length === 0 ? (
        <EmptyState
          icon={Mail}
          title={hasActiveFilters ? "No matching messages" : "No messages received yet"}
          text={
            hasActiveFilters
              ? "Try adjusting your search query or status filter to see other messages."
              : "Inquiries submitted via the Contact form will be collected and displayed here."
          }
          action={
            hasActiveFilters ? (
              <Button variant="outline" size="sm" onClick={handleClearFilters}>
                Clear filters
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="rounded-xl border border-border/80 bg-card/60 overflow-hidden shadow-xl">
          <div className="overflow-x-auto [scrollbar-width:thin]">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border/80 bg-background/80 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Sender</th>
                  <th className="px-5 py-3.5 font-semibold">Topic / Subject</th>
                  <th className="px-5 py-3.5 font-semibold">Message Preview</th>
                  <th className="px-5 py-3.5 font-semibold">Academic</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 font-semibold">Date</th>
                  <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredMessages.map((msg) => {
                  const statusInfo = messageStatusMeta[msg.status] || messageStatusMeta.new;
                  const dateStr = new Date(msg.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                  const isNew = msg.status === "new";

                  return (
                    <tr
                      key={msg.id}
                      onClick={() => handleOpenDetail(msg)}
                      className={cn(
                        "group cursor-pointer transition-colors hover:bg-white/[0.03]",
                        isNew && "bg-primary/[0.02]"
                      )}
                    >
                      {/* Sender */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "flex size-9 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold",
                              isNew
                                ? "bg-primary text-black"
                                : "bg-card border border-border text-foreground"
                            )}
                          >
                            {msg.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="truncate font-semibold text-foreground">
                                {msg.name}
                              </p>
                              {isNew && (
                                <span className="size-1.5 rounded-full bg-primary shrink-0" />
                              )}
                            </div>
                            <p className="truncate text-xs text-muted-foreground font-mono">
                              {msg.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Topic */}
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span className="inline-flex rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            {msg.subject}
                          </span>
                          {msg.resume_path && (
                            <span className="inline-flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                              <FileText className="size-3 text-primary" />
                              <span>Resume attached</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Message Preview */}
                      <td className="px-5 py-4 max-w-xs">
                        <p className="truncate text-xs text-slate-300">
                          {msg.message}
                        </p>
                      </td>

                      {/* Academic */}
                      <td className="px-5 py-4">
                        <div className="text-xs">
                          {msg.university && (
                            <p className="truncate text-slate-300 max-w-[180px]">
                              {msg.university}
                            </p>
                          )}
                          {msg.registration_number && (
                            <p className="font-mono text-[11px] text-muted-foreground">
                              Reg: {msg.registration_number}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-mono font-medium",
                            statusInfo.badgeClass
                          )}
                        >
                          <span className={cn("size-1.5 rounded-full", statusInfo.dotClass)} />
                          {statusInfo.label}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 whitespace-nowrap text-xs text-muted-foreground font-mono">
                        {dateStr}
                      </td>

                      {/* Actions */}
                      <td
                        className="px-5 py-4 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                            >
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44 bg-popover text-popover-foreground border-border">
                            <DropdownMenuItem
                              onClick={() => handleOpenDetail(msg)}
                              className="gap-2 cursor-pointer text-slate-200"
                            >
                              <Eye className="size-3.5" />
                              <span>View Details</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem asChild className="gap-2 cursor-pointer text-slate-200">
                              <a
                                href={`mailto:${msg.email}?subject=${encodeURIComponent(
                                  `Re: [AWS Builder Group LPU] ${msg.subject}`
                                )}`}
                              >
                                <Reply className="size-3.5" />
                                <span>Reply via Email</span>
                              </a>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator className="bg-slate-800" />

                            <div className="px-2 py-1.5 text-[10px] font-mono uppercase text-muted-foreground">
                              Set Status
                            </div>

                            <DropdownMenuItem
                              onClick={() => handleStatusChange(msg, "new")}
                              className="gap-2 cursor-pointer text-amber-400"
                            >
                              <span className="size-1.5 rounded-full bg-amber-400" />
                              <span>Mark as New</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => handleStatusChange(msg, "in_progress")}
                              className="gap-2 cursor-pointer text-purple-400"
                            >
                              <span className="size-1.5 rounded-full bg-purple-400" />
                              <span>In Progress</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => handleStatusChange(msg, "resolved")}
                              className="gap-2 cursor-pointer text-emerald-400"
                            >
                              <span className="size-1.5 rounded-full bg-emerald-400" />
                              <span>Mark as Resolved</span>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator className="bg-slate-800" />

                            <DropdownMenuItem
                              onClick={() => handleDeleteRequest(msg)}
                              className="gap-2 cursor-pointer text-red-400 focus:text-red-300"
                            >
                              <Trash2 className="size-3.5" />
                              <span>Delete Message</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Detail Drawer */}
      <MessageDetailDrawer
        open={detailOpen}
        onOpenChange={setDetailOpen}
        message={detailMessage}
        onStatusChange={handleStatusChange}
        onDeleteRequest={handleDeleteRequest}
      />

      {/* 6. Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Contact Message?"
        description={`Are you sure you want to delete the message from "${messageToDelete?.name}"? This action cannot be undone.`}
        confirmLabel={deleteLoading ? "Deleting..." : "Delete Message"}
        tone="danger"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
