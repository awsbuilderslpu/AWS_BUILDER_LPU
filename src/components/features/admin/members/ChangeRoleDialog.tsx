"use client";

import * as React from "react";
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
import { SelectField, type SelectOption } from "@/components/ui/SelectField";
import { CheckboxField } from "@/components/ui/CheckboxField";
import { adminCopy } from "@/data/admin";
import { roleMeta } from "@/data/roles";
import { notify } from "@/lib/admin/notify";
import { changeMemberRolesAction } from "@/lib/members/actions";
import {
  adminChoice,
  countByReason,
  roleChoices,
  splitRoleChange,
} from "@/lib/members/view-logic";
import type { MemberTarget } from "@/lib/members/rules";
import type { AppRole, MemberListRow } from "@/lib/members/types";
import { summarizeResults } from "@/lib/registrations/view-logic";

export interface ChangeRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rows: MemberListRow[];
  actorId: string;
  actorRole?: AppRole | null;
  onDone: () => void;
}

export function ChangeRoleDialog({
  open,
  onOpenChange,
  rows,
  actorId,
  actorRole,
  onDone,
}: ChangeRoleDialogProps) {
  const copy = adminCopy.members;
  const isBulk = rows.length > 1;

  const [prevOpen, setPrevOpen] = React.useState(open);
  const [chosenRole, setChosenRole] = React.useState<AppRole>("member");
  const [confirmedAdmin, setConfirmedAdmin] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  // Initialize selected role whenever dialog opens
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setChosenRole(rows.length === 1 ? rows[0].role : "member");
      setConfirmedAdmin(false);
    }
  }

  const choices = React.useMemo(() => roleChoices(isBulk), [isBulk]);

  const singleTargetMeta = React.useMemo<MemberTarget | null>(() => {
    if (rows.length !== 1) return null;
    return {
      userId: rows[0].userId,
      role: rows[0].role,
      isActive: rows[0].isActive,
      registrationStatus: rows[0].registrationStatus,
    };
  }, [rows]);

  const adminCheck = React.useMemo(() => {
    if (!singleTargetMeta) return { enabled: false as const, reason: "self" as const };
    return adminChoice(singleTargetMeta, actorId, actorRole);
  }, [singleTargetMeta, actorId, actorRole]);

  const selectOptions = React.useMemo<SelectOption[]>(() => {
    return choices.map((r) => {
      const meta = roleMeta[r];
      if (r === "admin" && !isBulk && !adminCheck.enabled) {
        const disabledReason =
          adminCheck.reason === "only_administrator"
            ? (copy.roleDialog.onlyAdministratorDisabled || "Only an Administrator can appoint Admins.")
            : copy.roleDialog.adminDisabled;
        return {
          value: r,
          label: `${meta.label} (${disabledReason})`,
          disabled: true,
        };
      }
      return {
        value: r,
        label: meta.label,
      };
    });
  }, [choices, isBulk, adminCheck, copy.roleDialog.adminDisabled, copy.roleDialog.onlyAdministratorDisabled]);

  const targets = React.useMemo<MemberTarget[]>(() => {
    return rows.map((r) => ({
      userId: r.userId,
      role: r.role,
      isActive: r.isActive,
      registrationStatus: r.registrationStatus,
    }));
  }, [rows]);

  const { applicable, skipped } = React.useMemo(() => {
    return splitRoleChange(targets, chosenRole, actorId, actorRole);
  }, [targets, chosenRole, actorId, actorRole]);

  const skippedCounts = React.useMemo(() => {
    return countByReason(skipped);
  }, [skipped]);

  const isSaveDisabled =
    saving ||
    applicable.length === 0 ||
    (chosenRole === "admin" && !confirmedAdmin);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaveDisabled) return;

    setSaving(true);
    try {
      const applicableIds = applicable.map((t) => t.userId);
      const res = await changeMemberRolesAction({
        ids: applicableIds,
        role: chosenRole,
        confirmAdmin: chosenRole === "admin" ? confirmedAdmin : undefined,
      });

      if (!res.ok && (!res.results || res.results.length === 0)) {
        const errKey = res.error || "failed";
        notify.error(
          copy.errors[errKey as keyof typeof copy.errors] || copy.errors.failed
        );
        return;
      }

      const summary = summarizeResults(res.results || []);

      if (summary.okCount > 0) {
        notify.success(copy.results.roleChanged(summary.okCount));
      }

      if (summary.failedCount > 0) {
        notify.error(copy.results.failedSome(summary.failedCount));
      }

      // Notify for each skipped reason from splitRoleChange
      Object.entries(skippedCounts).forEach(([reason, count]) => {
        const reasonText =
          copy.results.reasons[reason as keyof typeof copy.results.reasons] ||
          reason;
        notify.info(copy.roleDialog.skipped(count, reasonText));
      });

      onOpenChange(false);
      onDone();
    } catch {
      notify.error(copy.errors.failed);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border border-border bg-card p-6 shadow-2xl sm:max-w-md">
        <form onSubmit={handleSave} className="space-y-5">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-foreground">
              {copy.roleDialog.title(rows.length)}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
              {copy.roleDialog.text}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <SelectField
              id="change-role-select"
              label={copy.roleDialog.label}
              hint={copy.roleDialog.hint}
              value={chosenRole}
              onChange={(e) => setChosenRole(e.target.value as AppRole)}
              options={selectOptions}
              disabled={saving}
            />

            {isBulk && (
              <p className="text-[12.5px] text-muted-foreground">
                {copy.roleDialog.bulkNote}
              </p>
            )}

            {chosenRole === "admin" && !isBulk && (
              <div className="space-y-3 rounded-lg border border-primary/30 bg-primary/5 p-3.5">
                <div className="space-y-1">
                  <h5 className="text-[14px] font-semibold text-foreground">
                    {copy.roleDialog.adminTitle}
                  </h5>
                  <p className="text-[12.5px] text-muted-foreground leading-relaxed">
                    {copy.roleDialog.adminText}
                  </p>
                </div>
                <CheckboxField
                  id="admin-confirm-checkbox"
                  label={copy.roleDialog.adminConfirm}
                  checked={confirmedAdmin}
                  onChange={(e) => setConfirmedAdmin(e.target.checked)}
                  disabled={saving}
                />
              </div>
            )}

            {skipped.length > 0 && (
              <div
                role="status"
                className="rounded-md border border-border bg-card/60 p-3 text-[13px] text-muted-foreground space-y-1"
              >
                {Object.entries(skippedCounts).map(([reason, count]) => {
                  const reasonText =
                    copy.results.reasons[
                      reason as keyof typeof copy.results.reasons
                    ] || reason;
                  return (
                    <p key={reason}>
                      {copy.roleDialog.skipped(count, reasonText)}
                    </p>
                  );
                })}
              </div>
            )}
          </div>

          <DialogFooter className="mt-6 flex flex-row items-center justify-end gap-3 sm:space-x-0">
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => onOpenChange(false)}
              className="h-10 px-4 border-border bg-card/40 hover:bg-card/80 text-foreground cursor-pointer font-medium"
            >
              {copy.roleDialog.cancel}
            </Button>

            <Button
              type="submit"
              disabled={isSaveDisabled}
              className="h-10 px-5 bg-primary text-background hover:bg-primary-hover font-semibold cursor-pointer transition-colors"
            >
              {saving ? (
                <>
                  <LoaderCircle
                    className="size-4 animate-spin mr-2 shrink-0"
                    aria-hidden="true"
                  />
                  <span>{copy.roleDialog.working}</span>
                </>
              ) : (
                copy.roleDialog.submit
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
