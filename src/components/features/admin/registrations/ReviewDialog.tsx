"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/SelectField";
import { CheckboxField } from "@/components/ui/CheckboxField";
import { fieldClass } from "@/components/ui/formStyles";
import { adminCopy } from "@/data/admin";
import { roleMeta } from "@/data/roles";
import { notify } from "@/lib/admin/notify";
import { reviewRegistrationsAction } from "@/lib/registrations/actions";
import {
  approvableRoles,
  type ApprovableRole,
  type RegistrationListRow,
} from "@/lib/registrations/types";
import {
  differingRoleCount,
  hasAdminRequest,
  initialApprovalRole,
  rowName,
  summarizeResults,
} from "@/lib/registrations/view-logic";
import { cn } from "@/lib/utils";

export interface ReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: "approve" | "reject";
  rows: RegistrationListRow[];
  mailConfigured: boolean;
  onSuccess?: () => void;
}

export function ReviewDialog({
  open,
  onOpenChange,
  action,
  rows,
  mailConfigured,
  onSuccess,
}: ReviewDialogProps) {
  const router = useRouter();
  const copy = adminCopy.registrations;
  const isApprove = action === "approve";
  const isBulk = rows.length > 1;

  const [role, setRole] = React.useState<ApprovableRole>("student");
  const [sendEmail, setSendEmail] = React.useState(mailConfigured);
  const [note, setNote] = React.useState("");
  const [includeNoteInEmail, setIncludeNoteInEmail] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  // Sync state on open or row change
  React.useEffect(() => {
    if (open) {
      const requestedRoles = rows.map((r) => r.requestedRole);
      setRole(initialApprovalRole(requestedRoles));
      setSendEmail(mailConfigured);
      setNote("");
      setIncludeNoteInEmail(false);
      setPending(false);
    }
  }, [open, rows, mailConfigured]);

  const handleNoteChange = (val: string) => {
    if (val.length <= 2000) {
      setNote(val);
      if (val.trim().length > 0 && !includeNoteInEmail) {
        setIncludeNoteInEmail(true);
      } else if (val.trim().length === 0 && includeNoteInEmail) {
        setIncludeNoteInEmail(false);
      }
    }
  };

  const singleName = rows.length === 1 ? rowName(rows[0]) : "";

  const title = isApprove
    ? isBulk
      ? copy.dialog.approve.titleBulk(rows.length)
      : copy.dialog.approve.title
    : isBulk
    ? copy.dialog.reject.titleBulk(rows.length)
    : copy.dialog.reject.title;

  const description = isApprove
    ? isBulk
      ? copy.dialog.approve.descriptionBulk(rows.length)
      : `Grant membership and set access role for ${singleName}.`
    : isBulk
    ? copy.dialog.reject.descriptionBulk(rows.length)
    : `Are you sure you want to reject registration for ${singleName}?`;

  const submitLabel = isApprove
    ? isBulk
      ? copy.dialog.approve.confirmBulk
      : copy.dialog.approve.confirm
    : isBulk
    ? copy.dialog.reject.confirmBulk
    : copy.dialog.reject.confirm;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pending || rows.length === 0) return;

    setPending(true);
    try {
      const ids = rows.map((r) => r.id);
      const res = await reviewRegistrationsAction({
        ids,
        action,
        role: isApprove ? role : undefined,
        note: note.trim() || undefined,
        sendEmail,
        includeNote: sendEmail ? includeNoteInEmail : false,
      });

      if (!res.ok && (!res.results || res.results.length === 0)) {
        const errorKey = res.error || "failed";
        const msg =
          copy.results.errorMessages[
            errorKey as keyof typeof copy.results.errorMessages
          ] || copy.results.errorMessages.failed;
        notify.error(msg);
        return;
      }

      const summary = summarizeResults(res.results || []);

      if (summary.failedCount > 0) {
        const firstErrorCode = summary.errorCodes[0] || "failed";
        const mappedError =
          copy.results.errorMessages[
            firstErrorCode as keyof typeof copy.results.errorMessages
          ] || copy.results.errorMessages.failed;

        if (summary.okCount > 0) {
          notify.error(
            `${copy.results.bulkPartial(summary.okCount, summary.failedCount)}: ${mappedError}`
          );
        } else {
          notify.error(mappedError);
        }
      } else {
        const successMsg = isBulk
          ? copy.results.bulkSuccess(summary.okCount, action)
          : copy.results.singleSuccess(action);
        notify.success(successMsg);

        if (sendEmail) {
          if (summary.email.sent > 0) {
            notify.info(copy.results.emailOutcome.sent);
          } else if (summary.email.failed > 0) {
            notify.error(copy.results.emailOutcome.failed);
          } else if (summary.email.notConfigured > 0) {
            notify.info(copy.results.emailOutcome.not_configured);
          }
        }
      }

      onOpenChange(false);
      router.refresh();
      onSuccess?.();
    } catch {
      notify.error(copy.results.errorMessages.failed);
    } finally {
      setPending(false);
    }
  };

  const requestedRoles = rows.map((r) => r.requestedRole);
  const diffCount = differingRoleCount(requestedRoles, role);
  const hasAdmin = hasAdminRequest(requestedRoles);

  const roleSelectOptions = approvableRoles.map((r) => ({
    value: r,
    label: roleMeta[r]?.label || r,
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border border-border bg-card p-6 shadow-2xl sm:max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-5">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-white">
              {title}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </DialogDescription>
          </DialogHeader>

          {isApprove && (
            <div className="space-y-3">
              <SelectField
                label={copy.dialog.roleLabel}
                options={roleSelectOptions}
                value={role}
                onChange={(e) => setRole(e.target.value as ApprovableRole)}
                disabled={pending}
              />

              <div className="space-y-1.5 text-[12px] leading-relaxed">
                <p className="text-muted-foreground">
                  {copy.dialog.roleHint(roleMeta[role]?.label || role)}
                </p>

                {role === "core" && (
                  <p className="text-violet font-medium">
                    {copy.dialog.coreHint}
                  </p>
                )}

                {!isBulk && rows[0]?.requestedRole !== role && (
                  <p className="text-primary font-medium">
                    {copy.dialog.roleDiffer(
                      roleMeta[rows[0].requestedRole]?.label ||
                        rows[0].requestedRole,
                      roleMeta[role]?.label || role
                    )}
                  </p>
                )}

                {isBulk && diffCount > 0 && (
                  <p className="text-primary font-medium">
                    {copy.dialog.roleDifferBulk(diffCount)}
                  </p>
                )}

                {hasAdmin && (
                  <p className="text-red-400 font-medium">
                    {copy.dialog.hasAdminRequest}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Email option */}
          <div className="space-y-1.5 rounded-lg border border-border bg-background/40 p-3.5">
            <CheckboxField
              label={
                isBulk
                  ? copy.dialog.emailApplicantBulk
                  : copy.dialog.emailApplicant
              }
              checked={sendEmail}
              onChange={(e) => setSendEmail(e.target.checked)}
              disabled={pending || !mailConfigured}
            />
            {!mailConfigured && (
              <p className="pl-6 text-[11.5px] text-muted-foreground">
                {copy.dialog.emailDisabled}
              </p>
            )}
          </div>

          {/* Note */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[12.5px] font-medium text-white">
              <label htmlFor="review-note">{copy.dialog.noteLabel}</label>
              <span className="text-[11.5px] text-muted-foreground font-normal">
                {note.length} / 2000
              </span>
            </div>
            <textarea
              id="review-note"
              rows={3}
              value={note}
              onChange={(e) => handleNoteChange(e.target.value)}
              placeholder={copy.dialog.notePlaceholder}
              disabled={pending}
              className={cn(fieldClass, "h-auto py-2.5 resize-none leading-relaxed")}
            />

            {sendEmail && (
              <div className="pt-1">
                <CheckboxField
                  label={copy.dialog.includeNoteInEmail}
                  checked={includeNoteInEmail}
                  onChange={(e) => setIncludeNoteInEmail(e.target.checked)}
                  disabled={pending}
                />
              </div>
            )}
          </div>

          <DialogFooter className="mt-6 flex flex-row items-center justify-end gap-3 sm:space-x-0">
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => onOpenChange(false)}
              className="h-11 px-5 border-border bg-card/40 hover:bg-card/80 text-foreground cursor-pointer font-medium"
            >
              {adminCopy.kit.cancel}
            </Button>

            <Button
              type="submit"
              disabled={pending}
              className={cn(
                "h-11 px-5 font-medium cursor-pointer transition-colors",
                isApprove
                  ? "bg-primary text-background hover:bg-primary-hover font-semibold"
                  : "bg-red-500/90 hover:bg-red-500 text-white font-semibold"
              )}
            >
              {pending ? (
                <>
                  <LoaderCircle
                    className="size-4 animate-spin shrink-0 mr-2"
                    aria-hidden="true"
                  />
                  <span>{submitLabel}</span>
                </>
              ) : (
                submitLabel
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
