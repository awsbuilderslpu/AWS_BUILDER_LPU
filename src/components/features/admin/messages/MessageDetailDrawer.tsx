"use client";

import * as React from "react";
import {
  Mail,
  Phone,
  GraduationCap,
  Hash,
  Tag,
  Clock,
  FileText,
  Download,
  Copy,
  Check,
  Trash2,
  Reply,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { DetailDrawer } from "@/components/features/admin/kit/DetailDrawer";
import { DrawerSection } from "@/components/features/admin/kit/DrawerSection";
import { DetailRow } from "@/components/features/admin/kit/DetailRow";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { ContactMessage, MessageStatus } from "@/lib/messages/types";
import { messageStatusMeta } from "@/lib/messages/types";
import { getResumeDownloadUrlAction } from "@/lib/messages/actions";

export interface MessageDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: ContactMessage | null;
  onStatusChange: (message: ContactMessage, nextStatus: MessageStatus) => Promise<void>;
  onDeleteRequest: (message: ContactMessage) => void;
}

export function MessageDetailDrawer({
  open,
  onOpenChange,
  message,
  onStatusChange,
  onDeleteRequest,
}: MessageDetailDrawerProps) {
  const [downloadingResume, setDownloadingResume] = React.useState(false);
  const [copiedMessage, setCopiedMessage] = React.useState(false);
  const [updatingStatus, setUpdatingStatus] = React.useState(false);

  if (!message) return null;

  const statusInfo = messageStatusMeta[message.status] || messageStatusMeta.new;

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message.message);
      setCopiedMessage(true);
      toast.success("Message copied to clipboard");
      setTimeout(() => setCopiedMessage(false), 2000);
    } catch {
      toast.error("Failed to copy message");
    }
  };

  const handleDownloadResume = async () => {
    if (!message.resume_path) return;
    setDownloadingResume(true);
    try {
      const res = await getResumeDownloadUrlAction(message.resume_path);
      if (res.url) {
        window.open(res.url, "_blank", "noopener,noreferrer");
      } else {
        toast.error(res.error || "Unable to download resume file");
      }
    } catch {
      toast.error("Failed to download resume");
    } finally {
      setDownloadingResume(false);
    }
  };

  const handleStatusSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value as MessageStatus;
    setUpdatingStatus(true);
    try {
      await onStatusChange(message, next);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const formattedDate = new Date(message.created_at).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <DetailDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={message.subject || "Message Details"}
      description={`Received from ${message.name} on ${formattedDate}`}
      widthClass="sm:max-w-2xl"
      footer={
        <div className="flex w-full items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              onOpenChange(false);
              onDeleteRequest(message);
            }}
            className="text-red-400 hover:bg-red-500/10 hover:text-red-300 gap-1.5"
          >
            <Trash2 className="size-4" />
            <span>Delete</span>
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            <Button
              asChild
              size="sm"
              className="gap-2 bg-[#FF9900] text-black hover:bg-[#FF9900]/90 font-medium"
            >
              <a
                href={`mailto:${message.email}?subject=${encodeURIComponent(
                  `Re: [AWS Builder Group LPU] ${message.subject}`
                )}`}
              >
                <Reply className="size-4" />
                <span>Reply by Email</span>
              </a>
            </Button>
          </div>
        </div>
      }
    >
      {/* 1. Header Card: Status & Sender Overview */}
      <div className="rounded-xl border border-border/80 bg-card/60 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/60">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {message.name}
            </h3>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground font-mono">
              <Clock className="size-3.5 text-primary" />
              <span>{formattedDate}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Status:</span>
            <div className="relative inline-flex items-center">
              <select
                value={message.status}
                onChange={handleStatusSelect}
                disabled={updatingStatus}
                aria-label="Update message status"
                className={cn(
                  "cursor-pointer appearance-none rounded-lg border px-3 py-1.5 pr-8 text-xs font-medium font-mono transition-all",
                  statusInfo.badgeClass
                )}
              >
                <option value="new" className="bg-[#0A0E17] text-amber-400">
                  New
                </option>
                <option value="read" className="bg-[#0A0E17] text-blue-400">
                  Read
                </option>
                <option value="in_progress" className="bg-[#0A0E17] text-purple-400">
                  In Progress
                </option>
                <option value="resolved" className="bg-[#0A0E17] text-emerald-400">
                  Resolved
                </option>
                <option value="archived" className="bg-[#0A0E17] text-slate-400">
                  Archived
                </option>
              </select>
              <span className="pointer-events-none absolute right-2 text-xs opacity-60">
                ▼
              </span>
            </div>
          </div>
        </div>

        {/* Sender details */}
        <div className="pt-3 divide-y divide-border/40">
          <DetailRow icon={Mail} label="Email">
            <a
              href={`mailto:${message.email}`}
              className="text-primary hover:underline font-mono text-xs sm:text-sm"
            >
              {message.email}
            </a>
          </DetailRow>

          {message.phone && (
            <DetailRow icon={Phone} label="Phone">
              <a
                href={`tel:${message.phone}`}
                className="hover:text-primary font-mono text-xs sm:text-sm"
              >
                {message.phone}
              </a>
            </DetailRow>
          )}

          {message.university && (
            <DetailRow icon={GraduationCap} label="University">
              <span className="text-xs sm:text-sm text-foreground/90">
                {message.university}
              </span>
            </DetailRow>
          )}

          {message.registration_number && (
            <DetailRow icon={Hash} label="Reg Number">
              <span className="font-mono text-xs sm:text-sm text-foreground/90">
                {message.registration_number}
              </span>
            </DetailRow>
          )}

          <DetailRow icon={Tag} label="Topic">
            <span className="inline-flex items-center rounded-md border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              {message.subject}
            </span>
          </DetailRow>
        </div>
      </div>

      {/* 2. Message Content */}
      <DrawerSection icon={MessageSquare} title="Message">
        <div className="relative rounded-xl border border-border/80 bg-background/60 p-4 sm:p-5">
          <div className="absolute right-3 top-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCopyMessage}
              className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground gap-1.5"
            >
              {copiedMessage ? (
                <>
                  <Check className="size-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="size-3.5" />
                  <span>Copy</span>
                </>
              )}
            </Button>
          </div>

          <p className="whitespace-pre-wrap pr-16 text-sm sm:text-[15px] leading-relaxed text-slate-200">
            {message.message}
          </p>
        </div>
      </DrawerSection>

      {/* 3. Resume / CV Attachment */}
      {message.resume_path && (
        <DrawerSection icon={FileText} title="Attachment">
          <div className="flex items-center justify-between rounded-xl border border-border/80 bg-card/60 p-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                <FileText className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {message.resume_path.split("/").pop() || "Resume File"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Applicant Resume / Curriculum Vitae
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownloadResume}
              disabled={downloadingResume}
              className="gap-1.5 shrink-0"
            >
              {downloadingResume ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <Download className="size-3.5" />
                  <span>Download</span>
                </>
              )}
            </Button>
          </div>
        </DrawerSection>
      )}
    </DetailDrawer>
  );
}
