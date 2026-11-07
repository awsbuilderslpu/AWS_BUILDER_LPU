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

  const actions = details ? allowedActions(details.status) : [];

  return (
    <>
      <DetailDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={copy.drawer.title}
      description={
        details
          ? copy.drawer.subtitle(formatIst(details.appliedAt, { withTime: false }))
          : copy.drawer.title
      }
      footer={
        details && actions.length > 0 ? (
          <div className="flex flex-wrap items-center justify-end gap-2.5 w-full">
            {actions.includes("approve") && (
              <Button
                type="button"
                onClick={() => handleActionClick("approve")}
                className="h-10 px-4 bg-primary text-background hover:bg-primary-hover font-semibold cursor-pointer"
              >
                {copy.actions.approve}
              </Button>
            )}

            {actions.includes("reject") && (
              <Button
                type="button"
                onClick={() => handleActionClick("reject")}
                className="h-10 px-4 bg-red-500/90 hover:bg-red-500 text-white font-medium cursor-pointer"
              >
                {copy.actions.reject}
              </Button>
            )}

            {actions.includes("reopen") && (
              <Button
                type="button"
                variant="outline"
                onClick={() => handleActionClick("reopen")}
                className="h-10 px-4 font-medium cursor-pointer"
              >
                {copy.actions.reopen}
              </Button>
            )}

            {actions.includes("archive") && (
              <Button
                type="button"
                variant="outline"
                onClick={() => handleActionClick("archive")}
                className="h-10 px-4 font-medium text-red-400 border-red-400/40 hover:bg-red-400/10 cursor-pointer"
              >
                {copy.actions.archive}
              </Button>
            )}

            {actions.includes("restore") && (
              <Button
                type="button"
                variant="outline"
                onClick={() => handleActionClick("restore")}
                className="h-10 px-4 font-medium cursor-pointer"
              >
                {copy.actions.restore}
              </Button>
            )}
          </div>
        ) : undefined
      }
    >
      {loading ? (
        <div className="space-y-4 py-6">
          <div className="h-14 rounded-lg bg-card/60 animate-pulse border border-border" />
          <div className="h-32 rounded-lg bg-card/60 animate-pulse border border-border" />
          <div className="h-32 rounded-lg bg-card/60 animate-pulse border border-border" />
          <div className="h-32 rounded-lg bg-card/60 animate-pulse border border-border" />
        </div>
      ) : !details ? (
        <div className="py-12 text-center text-sm text-muted-foreground">
          {copy.empty.title}
        </div>
      ) : (
        <div className="space-y-5">
          {/* Header Card */}
          <div className="rounded-lg border border-border bg-card/50 p-4 space-y-2.5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-[17px] font-semibold text-white truncate leading-snug">
                  {name}
                </h3>
                <p className="text-[13px] text-muted-foreground truncate leading-tight mt-0.5">
                  {details.email}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditProfileOpen(true)}
                className="h-8 px-2.5 text-xs font-medium cursor-pointer border-border hover:bg-card/80 shrink-0 flex items-center gap-1.5"
              >
                <Pencil className="size-3.5" />
                <span>Edit Profile</span>
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <StatusBadge tone={statusTones[details.status] ?? "muted"}>
                {copy.statusLabels[details.status] ?? details.status}
              </StatusBadge>
              <RoleBadge role={details.requestedRole} />
            </div>
          </div>

          {/* Contact */}
          <DrawerSection icon={Mail} title={copy.drawer.sections.contact}>
            <DetailRow label={copy.drawer.fields.email}>
              <a
                href={`mailto:${details.email}`}
                className="text-primary hover:underline underline-offset-4"
              >
                {details.email}
              </a>
            </DetailRow>
            <DetailRow label={copy.drawer.fields.phone}>
              {formattedPhone}
            </DetailRow>
          </DrawerSection>

          {/* Personal */}
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

          {/* Academic */}
          <DrawerSection
            icon={GraduationCap}
            title={copy.drawer.sections.academic}
          >
            <DetailRow label={copy.drawer.fields.programme}>
              {programmeLabel(details.programme, details.department, departments)}
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

          {/* Interests */}
          <DrawerSection icon={Sparkles} title={copy.drawer.sections.interests}>
            {details.interests && details.interests.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {details.interests.map((interest) => (
                  <StatusBadge key={interest} tone="violet">
                    {interest}
                  </StatusBadge>
                ))}
              </div>
            ) : (
              <span className="text-[13.5px] text-muted-foreground">-</span>
            )}
          </DrawerSection>

          {/* Application */}
          <DrawerSection
            icon={ClipboardList}
            title={copy.drawer.sections.application}
          >
            <DetailRow label={copy.drawer.fields.regNo}>
              <span className="font-mono text-[13.5px]">
                {details.registrationNumber || "-"}
              </span>
            </DetailRow>
            <DetailRow label={copy.drawer.fields.appliedAt}>
              {formatIst(details.appliedAt)}
            </DetailRow>
          </DrawerSection>

          {/* Review */}
          <DrawerSection icon={ShieldCheck} title={copy.drawer.sections.review}>
            <DetailRow label={copy.drawer.fields.status}>
              <StatusBadge tone={statusTones[details.status] ?? "muted"}>
                {copy.statusLabels[details.status] ?? details.status}
              </StatusBadge>
            </DetailRow>
            <DetailRow label={copy.drawer.fields.reviewedBy}>
              {details.reviewedByName || "-"}
            </DetailRow>
            <DetailRow label={copy.drawer.fields.reviewedAt}>
              {details.reviewedAt ? formatIst(details.reviewedAt) : "-"}
            </DetailRow>

            {/* Admin Note editing */}
            <div className="pt-3 border-t border-border mt-3 space-y-2">
              <div className="flex items-center justify-between text-[12.5px] font-medium text-white">
                <label htmlFor="drawer-admin-note">
                  {copy.drawer.fields.adminNote}
                </label>
                <span className="text-[11.5px] text-muted-foreground font-normal">
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
                className={cn(fieldClass, "h-auto py-2.5 resize-none leading-relaxed")}
              />
              <div className="flex justify-end pt-1">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleSaveNote}
                  disabled={savingNote || note === (details.adminNote || "")}
                  className="h-9 px-3.5 text-[13px] font-medium cursor-pointer"
                >
                  {savingNote ? (
                    <>
                      <LoaderCircle className="size-3.5 animate-spin mr-1.5 shrink-0" />
                      <span>{copy.drawer.saveNote}</span>
                    </>
                  ) : (
                    <>
                      <Save className="size-3.5 mr-1.5 shrink-0" />
                      <span>{copy.drawer.saveNote}</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DrawerSection>
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

