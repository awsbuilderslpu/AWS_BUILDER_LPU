"use client";

import * as React from "react";
import {
  Mail,
  User,
  GraduationCap,
  Sparkles,
  ClipboardList,
  ShieldCheck,
  LoaderCircle,
  Save,
  Pencil,
  Copy,
  Check,
  Building2,
  Calendar,
  BookOpen,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Archive,
  Phone,
  Hash,
  ExternalLink,
} from "lucide-react";
import { AdminEditProfileDialog } from "@/components/features/admin/profile/AdminEditProfileDialog";
import { DetailDrawer } from "@/components/features/admin/kit/DetailDrawer";
import { DrawerSection } from "@/components/features/admin/kit/DrawerSection";
import { DetailRow } from "@/components/features/admin/kit/DetailRow";
import { RoleBadge } from "@/components/features/admin/kit/RoleBadge";
import { StatusBadge, statusTones } from "@/components/features/admin/kit/StatusBadge";
import { Button } from "@/components/ui/button";
import { fieldClass } from "@/components/ui/formStyles";
import { adminCopy } from "@/data/admin";
import { departments, universities } from "@/data/registration";
import { formatDob } from "@/lib/auth/format";
import { formatIst } from "@/lib/datetime";
import { notify } from "@/lib/admin/notify";
import {
  getRegistrationDetailsAction,
  saveNoteAction,
} from "@/lib/registrations/actions";
import { programmeLabel } from "@/lib/registrations/labels";
import { allowedActions } from "@/lib/registrations/transitions";
import type {
  RegistrationDetails,
  RegistrationListRow,
  ReviewAction,
} from "@/lib/registrations/types";
import { rowName } from "@/lib/registrations/view-logic";
import { cn } from "@/lib/utils";

export interface RegistrationDrawerProps {
  id: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAction: (action: ReviewAction, row: RegistrationListRow) => void;
  onNoteUpdated?: () => void;
}

function CopyButton({
  text,
  label = "Copy",
  className,
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      notify.success(`${label} copied to clipboard`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      notify.error("Failed to copy");
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={copied ? "Copied!" : `Copy ${label}`}
      className={cn(
        "inline-flex items-center justify-center size-6 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0",
        className
      )}
    >
      {copied ? (
        <Check className="size-3 text-emerald-400" />
      ) : (
        <Copy className="size-3" />
      )}
      <span className="sr-only">Copy {label}</span>
    </button>
  );
}

function getInitials(name: string, fallback: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  if (parts.length === 1 && parts[0].length > 0) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  const fb = fallback.trim();
  return fb ? fb.slice(0, 2).toUpperCase() : "U";
}

export function RegistrationDrawer({
  id,
  open,
  onOpenChange,
  onAction,
  onNoteUpdated,
}: RegistrationDrawerProps) {
  const copy = adminCopy.registrations;

  const [details, setDetails] = React.useState<RegistrationDetails | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [note, setNote] = React.useState("");
  const [savingNote, setSavingNote] = React.useState(false);
  const [editProfileOpen, setEditProfileOpen] = React.useState(false);

  // Fetch details on open
  React.useEffect(() => {
    if (!open || !id) {
      setDetails(null);
      setNote("");
      return;
    }

    let isMounted = true;
    setLoading(true);

    getRegistrationDetailsAction(id)
      .then((data) => {
        if (!isMounted) return;
        setDetails(data);
        setNote(data?.adminNote || "");
      })
      .catch(() => {
        if (!isMounted) return;
        notify.error(copy.error.title);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [open, id, copy.error.title]);

  const handleSaveNote = async () => {
    if (!details || savingNote) return;
    setSavingNote(true);
    try {
      const res = await saveNoteAction({
        id: details.id,
        note: note.trim(),
      });
      if (res.ok) {
        setDetails((prev) => (prev ? { ...prev, adminNote: note.trim() || null } : null));
        notify.success(copy.drawer.noteSaved);
        onNoteUpdated?.();
      } else {
        const errKey = res.error || "failed";
        notify.error(
          copy.results.errorMessages[
            errKey as keyof typeof copy.results.errorMessages
          ] || copy.results.errorMessages.failed
        );
      }
    } catch {
      notify.error(copy.results.errorMessages.failed);
    } finally {
      setSavingNote(false);
    }
  };

  const handleActionClick = (action: ReviewAction) => {
    if (!details) return;
    onOpenChange(false);
    onAction(action, details);
  };

  const name = details ? rowName(details) : "";
  const uniLabel = details?.university
    ? universities.find((u) => u.value === details.university)?.label ||
      details.university
    : "-";

  const formattedPhone =
    details?.phoneNumber
      ? [details.phoneCountryCode, details.phoneNumber]
          .filter(Boolean)
          .join(" ")
      : "-";

  const cleanPhoneUrl = details?.phoneNumber
    ? `tel:${(details.phoneCountryCode || "+91").replace(/\s+/g, "")}${details.phoneNumber.replace(/\s+/g, "")}`
    : null;

  const appliedDateFormatted = details?.appliedAt
    ? formatIst(details.appliedAt, { withTime: true }) ||
      formatIst(details.appliedAt, { withTime: false }) ||
      null
    : null;

  const actions = details ? allowedActions(details.status) : [];
  const initials = details ? getInitials(name, details.email) : "U";

  // Status-based indicator colors
  const statusColorMap = {
    approved: "bg-emerald-400 ring-emerald-500/30",
    pending: "bg-amber-400 ring-amber-500/30",
    rejected: "bg-rose-400 ring-rose-500/30",
    archived: "bg-slate-400 ring-slate-500/30",
  };

  return (
    <>
      <DetailDrawer
        open={open}
        onOpenChange={onOpenChange}
        title={copy.drawer.title}
        widthClass="sm:max-w-3xl lg:max-w-4xl"
        description={
          appliedDateFormatted
            ? copy.drawer.subtitle(appliedDateFormatted)
            : "Applicant profile and review details"
        }
        footer={
          details ? (
            <div className="flex flex-wrap items-center justify-between gap-3 w-full">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="h-10 px-4 text-foreground hover:bg-muted rounded-xl cursor-pointer"
              >
                Close
              </Button>

              <div className="flex flex-wrap items-center gap-2.5">
                {actions.includes("reopen") && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleActionClick("reopen")}
                    className="h-10 px-4 border-border hover:bg-muted text-foreground font-medium rounded-xl cursor-pointer flex items-center gap-2"
                  >
                    <RotateCcw className="size-4" />
                    <span>{copy.actions.reopen}</span>
                  </Button>
                )}

                {actions.includes("archive") && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleActionClick("archive")}
                    className="h-10 px-4 border-border text-muted-foreground hover:text-rose-500 hover:border-rose-500/30 hover:bg-rose-500/10 font-medium rounded-xl cursor-pointer flex items-center gap-2"
                  >
                    <Archive className="size-4" />
                    <span>{copy.actions.archive}</span>
                  </Button>
                )}

                {actions.includes("restore") && (
                  <Button
                    type="button"
                    onClick={() => handleActionClick("restore")}
                    className="h-10 px-4.5 bg-primary text-background hover:bg-primary-hover font-semibold rounded-xl cursor-pointer flex items-center gap-2"
                  >
                    <RotateCcw className="size-4" />
                    <span>{copy.actions.restore}</span>
                  </Button>
                )}

                {actions.includes("reject") && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleActionClick("reject")}
                    className="h-10 px-4 text-rose-400 border-rose-500/30 hover:bg-rose-500/15 hover:border-rose-500/60 font-medium rounded-xl cursor-pointer flex items-center gap-2"
                  >
                    <XCircle className="size-4" />
                    <span>{copy.actions.reject}</span>
                  </Button>
                )}

                {actions.includes("approve") && (
                  <Button
                    type="button"
                    onClick={() => handleActionClick("approve")}
                    className="h-10 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-950/50 cursor-pointer flex items-center gap-2"
                  >
                    <CheckCircle2 className="size-4" />
                    <span>{copy.actions.approve}</span>
                  </Button>
                )}
              </div>
            </div>
          ) : undefined
        }
      >
        {loading ? (
          <div className="space-y-4 py-4">
            <div className="h-28 rounded-2xl bg-muted/50 animate-pulse border border-border" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-20 rounded-xl bg-muted/50 animate-pulse border border-border"
                />
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-64 rounded-xl bg-muted/50 animate-pulse border border-border" />
              <div className="h-64 rounded-xl bg-muted/50 animate-pulse border border-border" />
            </div>
          </div>
        ) : !details ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            {copy.empty.title}
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-5">
            {/* Hero Profile Card */}
            <div className="relative rounded-2xl border border-border bg-muted/40 p-4 sm:p-5 shadow-sm overflow-hidden">
              {/* Subtle ambient decorative gradient */}
              <div className="pointer-events-none absolute -top-12 -right-12 size-48 rounded-full bg-primary/10 blur-3xl" />

              <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5 sm:gap-4 min-w-0">
                  {/* Avatar with Initials & live status dot */}
                  <div className="relative shrink-0">
                    <div className="flex items-center justify-center size-13 sm:size-14 rounded-2xl bg-gradient-to-br from-primary/25 via-amber-500/15 to-primary/10 border border-primary/30 text-primary font-bold text-lg sm:text-xl shadow-inner tracking-wider">
                      {initials}
                    </div>
                    <span
                      title={`Status: ${details.status}`}
                      className={cn(
                        "absolute -bottom-1 -right-1 size-3.5 rounded-full ring-2 ring-background",
                        statusColorMap[details.status as keyof typeof statusColorMap] ||
                          "bg-slate-400 ring-slate-500/30"
                      )}
                    />
                  </div>

                  {/* Identity text */}
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg sm:text-xl font-bold text-foreground tracking-tight truncate leading-tight">
                        {name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs sm:text-[13px] text-muted-foreground">
                      <Mail className="size-3.5 text-muted-foreground shrink-0" />
                      <a
                        href={`mailto:${details.email}`}
                        className="truncate hover:text-primary transition-colors underline-offset-2 hover:underline"
                        title={details.email}
                      >
                        {details.email}
                      </a>
                      <CopyButton text={details.email} label="Email" />
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1.5">
                      <StatusBadge tone={statusTones[details.status] ?? "muted"}>
                        {copy.statusLabels[details.status] ?? details.status}
                      </StatusBadge>
                      <RoleBadge role={details.requestedRole} />
                      {details.registrationNumber && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono bg-card text-foreground border border-border">
                          <Hash className="size-3 text-muted-foreground" />
                          <span>{details.registrationNumber}</span>
                          <CopyButton
                            text={details.registrationNumber}
                            label="Reg No"
                            className="size-4 ml-0.5"
                          />
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Edit Profile Action */}
                <div className="self-end sm:self-center shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEditProfileOpen(true)}
                    className="h-9 px-3.5 text-xs font-medium border-border text-foreground hover:bg-muted transition-all cursor-pointer rounded-xl flex items-center gap-1.5 shadow-sm"
                  >
                    <Pencil className="size-3.5 text-primary" />
                    <span>Edit Profile</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Stat Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
              <div className="rounded-xl border border-border bg-muted/40 p-3 sm:p-3.5 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Building2 className="size-3.5 text-primary/80 shrink-0" />
                  <span className="truncate">Institution</span>
                </div>
                <div
                  className="text-xs sm:text-[13px] font-semibold text-foreground truncate"
                  title={uniLabel}
                >
                  {uniLabel}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-muted/40 p-3 sm:p-3.5 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <GraduationCap className="size-3.5 text-primary/80 shrink-0" />
                  <span className="truncate">Programme</span>
                </div>
                <div
                  className="text-xs sm:text-[13px] font-semibold text-foreground truncate"
                  title={programmeLabel(details.programme, details.department, departments)}
                >
                  {programmeLabel(details.programme, details.department, departments) || "-"}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-muted/40 p-3 sm:p-3.5 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <BookOpen className="size-3.5 text-primary/80 shrink-0" />
                  <span className="truncate">Study Year</span>
                </div>
                <div className="text-xs sm:text-[13px] font-semibold text-foreground truncate">
                  {details.studyYear ? `${details.studyYear} Year` : "-"}
                  {details.semester ? ` • Sem ${details.semester}` : ""}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-muted/40 p-3 sm:p-3.5 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Calendar className="size-3.5 text-primary/80 shrink-0" />
                  <span className="truncate">Graduation</span>
                </div>
                <div className="text-xs sm:text-[13px] font-semibold text-foreground truncate">
                  {details.graduationYear ? `Class of ${details.graduationYear}` : "-"}
                </div>
              </div>
            </div>

            {/* Two-Column Structured Dossier Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column */}
              <div className="space-y-4">
                {/* Academic Information */}
                <DrawerSection
                  icon={GraduationCap}
                  title={copy.drawer.sections.academic}
                >
                  <DetailRow label={copy.drawer.fields.programme}>
                    {programmeLabel(details.programme, details.department, departments) || "-"}
                  </DetailRow>
                  <DetailRow label={copy.drawer.fields.department}>
                    {details.department || "-"}
                  </DetailRow>
                  <DetailRow label={copy.drawer.fields.year}>
                    {details.studyYear || "-"}
                  </DetailRow>
                  <DetailRow label={copy.drawer.fields.semester}>
                    {details.semester || "-"}
                  </DetailRow>
                  <DetailRow label={copy.drawer.fields.gradYear}>
                    {details.graduationYear ? String(details.graduationYear) : "-"}
                  </DetailRow>
                </DrawerSection>

                {/* Personal Information */}
                <DrawerSection icon={User} title={copy.drawer.sections.personal}>
                  <DetailRow label={copy.drawer.fields.dob}>
                    {formatDob(details.dateOfBirth ?? undefined) || "-"}
                  </DetailRow>
                  <DetailRow label={copy.drawer.fields.gender}>
                    {details.gender || "-"}
                  </DetailRow>
                  <DetailRow label={copy.drawer.fields.university}>
                    {uniLabel}
                  </DetailRow>
                </DrawerSection>

                {/* Interests */}
                <DrawerSection icon={Sparkles} title={copy.drawer.sections.interests}>
                  {details.interests && details.interests.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {details.interests.map((interest) => (
                        <span
                          key={interest}
                          className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500">
                      No specific interests recorded
                    </span>
                  )}
                </DrawerSection>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {/* Contact Information */}
                <DrawerSection icon={Mail} title={copy.drawer.sections.contact}>
                  <DetailRow label={copy.drawer.fields.email}>
                    <div className="flex items-center justify-between gap-2">
                      <a
                        href={`mailto:${details.email}`}
                        className="text-primary hover:underline underline-offset-4 truncate"
                      >
                        {details.email}
                      </a>
                      <CopyButton text={details.email} label="Email" />
                    </div>
                  </DetailRow>
                  <DetailRow label={copy.drawer.fields.phone}>
                    <div className="flex items-center justify-between gap-2">
                      {cleanPhoneUrl ? (
                        <a
                          href={cleanPhoneUrl}
                          className="hover:text-primary transition-colors truncate"
                        >
                          {formattedPhone}
                        </a>
                      ) : (
                        <span>{formattedPhone}</span>
                      )}
                      {details.phoneNumber && (
                        <CopyButton text={formattedPhone} label="Phone" />
                      )}
                    </div>
                  </DetailRow>
                </DrawerSection>

                {/* Application & Review Details */}
                <DrawerSection
                  icon={ClipboardList}
                  title={copy.drawer.sections.application}
                >
                  <DetailRow label={copy.drawer.fields.regNo}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs sm:text-[13px]">
                        {details.registrationNumber || "-"}
                      </span>
                      {details.registrationNumber && (
                        <CopyButton
                          text={details.registrationNumber}
                          label="Registration Number"
                        />
                      )}
                    </div>
                  </DetailRow>
                  <DetailRow label={copy.drawer.fields.appliedAt}>
                    {appliedDateFormatted || "-"}
                  </DetailRow>
                  <DetailRow label={copy.drawer.fields.status}>
                    <StatusBadge tone={statusTones[details.status] ?? "muted"}>
                      {copy.statusLabels[details.status] ?? details.status}
                    </StatusBadge>
                  </DetailRow>
                  <DetailRow label={copy.drawer.fields.reviewedBy}>
                    {details.reviewedByName || "-"}
                  </DetailRow>
                  <DetailRow label={copy.drawer.fields.reviewedAt}>
                    {details.reviewedAt
                      ? formatIst(details.reviewedAt, { withTime: true }) ||
                        formatIst(details.reviewedAt, { withTime: false }) ||
                        details.reviewedAt
                      : "-"}
                  </DetailRow>
                </DrawerSection>

                {/* Internal Admin Note */}
                <DrawerSection icon={ShieldCheck} title={copy.drawer.sections.review}>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-medium text-foreground">
                      <label htmlFor="drawer-admin-note" className="flex items-center gap-1.5">
                        <span>{copy.drawer.fields.adminNote}</span>
                        <span className="text-[11px] text-muted-foreground font-normal">
                          (Private to admins)
                        </span>
                      </label>
                      <span className="text-[11px] text-muted-foreground">
                        {note.length} / 2000
                      </span>
                    </div>
                    <textarea
                      id="drawer-admin-note"
                      rows={3}
                      value={note}
                      maxLength={2000}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder={copy.drawer.notePlaceholder}
                      disabled={savingNote}
                      className={cn(
                        fieldClass,
                        "h-auto py-2.5 resize-none leading-relaxed text-xs sm:text-sm bg-background border-border focus:border-primary/60 rounded-xl"
                      )}
                    />
                    <div className="flex justify-end pt-0.5">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={handleSaveNote}
                        disabled={savingNote || note === (details.adminNote || "")}
                        className="h-8.5 px-3 text-xs font-medium rounded-xl cursor-pointer border-border text-foreground hover:bg-muted"
                      >
                        {savingNote ? (
                          <>
                            <LoaderCircle className="size-3.5 animate-spin mr-1.5 shrink-0" />
                            <span>{copy.drawer.saveNote}</span>
                          </>
                        ) : (
                          <>
                            <Save className="size-3.5 mr-1.5 shrink-0 text-primary" />
                            <span>{copy.drawer.saveNote}</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </DrawerSection>
              </div>
            </div>
          </div>
        )}
      </DetailDrawer>

      {details && (
        <AdminEditProfileDialog
          open={editProfileOpen}
          onOpenChange={setEditProfileOpen}
          userId={details.userId}
          initialData={{
            firstName: details.firstName || "",
            lastName: details.lastName || "",
            phoneCountryCode: details.phoneCountryCode || "+91",
            phoneNumber: details.phoneNumber || "",
            registrationNumber: details.registrationNumber || "",
            dateOfBirth: details.dateOfBirth || "",
            gender: (details.gender as "Male" | "Female") || null,
            university: details.university || "",
            programme: details.programme || "",
            department: details.department || "",
            studyYear: details.studyYear || "",
            semester: details.semester || "",
            graduationYear: details.graduationYear,
            interests: details.interests || [],
          }}
          onSaved={async () => {
            if (id) {
              const updated = await getRegistrationDetailsAction(id);
              if (updated) setDetails(updated);
            }
            onNoteUpdated?.();
          }}
        />
      )}
    </>
  );
}
