"use client";

import * as React from "react";
import {
  Mail,
  User,
  GraduationCap,
  Sparkles,
  Globe,
  ExternalLink,
  ShieldCheck,
  ClipboardList,
  LoaderCircle,
  Save,
} from "lucide-react";
import { FaLinkedin, FaGithub, FaInstagram, FaYoutube } from "react-icons/fa6";
import { DetailDrawer } from "@/components/features/admin/kit/DetailDrawer";
import { DrawerSection } from "@/components/features/admin/kit/DrawerSection";
import { DetailRow } from "@/components/features/admin/kit/DetailRow";
import { RoleBadge } from "@/components/features/admin/kit/RoleBadge";
import {
  StatusBadge,
  statusTones,
} from "@/components/features/admin/kit/StatusBadge";
import { ConfirmDialog } from "@/components/features/admin/kit/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/TextField";
import { SelectField, type SelectOption } from "@/components/ui/SelectField";
import { CheckboxField } from "@/components/ui/CheckboxField";
import { fieldClass } from "@/components/ui/formStyles";
import { adminCopy } from "@/data/admin";
import { departments, universities } from "@/data/registration";
import { roleMeta } from "@/data/roles";
import { formatIst } from "@/lib/datetime";
import { notify } from "@/lib/admin/notify";
import {
  changeMemberRolesAction,
  getMemberDetailsAction,
  removeMemberAction,
  setMembersActiveAction,
} from "@/lib/members/actions";
import {
  adminChoice,
  departmentLabel,
  roleChoices,
} from "@/lib/members/view-logic";
import type { MemberTarget } from "@/lib/members/rules";
import type { AppRole, MemberDetails } from "@/lib/members/types";
import {
  getAdminPublicTitle,
  setMemberPublicTitleAction,
} from "@/lib/profile/actions";
import { saveNoteAction } from "@/lib/registrations/actions";
import { programmeLabel } from "@/lib/registrations/labels";
import { cn } from "@/lib/utils";

export interface MemberDrawerProps {
  userId: string | null;
  currentUserId: string;
  onClose: () => void;
  onChanged: () => void;
}

export function MemberDrawer({
  userId,
  currentUserId,
  onClose,
  onChanged,
}: MemberDrawerProps) {
  const copy = adminCopy.members;

  const [details, setDetails] = React.useState<MemberDetails | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [loadError, setLoadError] = React.useState(false);

  // Notes state
  const [note, setNote] = React.useState("");
  const [savingNote, setSavingNote] = React.useState(false);

  // Role update state
  const [selectedRole, setSelectedRole] = React.useState<AppRole>("member");
  const [confirmAdmin, setConfirmAdmin] = React.useState(false);
  const [savingRole, setSavingRole] = React.useState(false);

  // Confirmation dialog states
  const [confirmActive, setConfirmActive] = React.useState<boolean | null>(null);
  const [confirmRemoveOpen, setConfirmRemoveOpen] = React.useState(false);

  // Public title state
  const [publicTitleInfo, setPublicTitleInfo] = React.useState<{
    publicTitle: string | null;
    isPublicProfile: boolean;
  } | null>(null);
  const [publicTitleInput, setPublicTitleInput] = React.useState("");
  const [savingPublicTitle, setSavingPublicTitle] = React.useState(false);
  const [publicTitleError, setPublicTitleError] = React.useState<string | null>(null);

  const fetchDetails = React.useCallback(async (id: string) => {
    setLoading(true);
    setLoadError(false);
    try {
      const [data, titleInfo] = await Promise.all([
        getMemberDetailsAction(id),
        getAdminPublicTitle(id),
      ]);
      if (!data) {
        setLoadError(true);
      } else {
        setDetails(data);
        setNote(data.adminNote || "");
        setSelectedRole(data.role);
        setConfirmAdmin(false);
        setPublicTitleInfo(titleInfo);
        setPublicTitleInput(titleInfo?.publicTitle || "");
        setPublicTitleError(null);
      }
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const [prevUserId, setPrevUserId] = React.useState(userId);
  if (userId !== prevUserId) {
    setPrevUserId(userId);
    if (!userId) {
      setDetails(null);
      setLoadError(false);
      setNote("");
      setPublicTitleInfo(null);
      setPublicTitleInput("");
      setPublicTitleError(null);
    }
  }

  React.useEffect(() => {
    if (!userId) return;

    let active = true;
    setLoading(true);
    setLoadError(false);

    Promise.all([
      getMemberDetailsAction(userId),
      getAdminPublicTitle(userId),
    ])
      .then(([data, titleInfo]) => {
        if (!active) return;
        if (!data) {
          setLoadError(true);
        } else {
          setDetails(data);
          setNote(data.adminNote || "");
          setSelectedRole(data.role);
          setConfirmAdmin(false);
          setPublicTitleInfo(titleInfo);
          setPublicTitleInput(titleInfo?.publicTitle || "");
          setPublicTitleError(null);
        }
      })
      .catch(() => {
        if (!active) return;
        setLoadError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [userId]);

  const isSelf = details ? details.userId === currentUserId : false;
  const isAdmin = details ? details.role === "admin" : false;

  const targetMeta = React.useMemo<MemberTarget | null>(() => {
    if (!details) return null;
    return {
      userId: details.userId,
      role: details.role,
      isActive: details.isActive,
      registrationStatus: details.registrationStatus,
    };
  }, [details]);

  const adminCheck = React.useMemo(() => {
    if (!targetMeta) return { enabled: false as const, reason: "self" as const };
    return adminChoice(targetMeta, currentUserId);
  }, [targetMeta, currentUserId]);

  const roleOptions = React.useMemo<SelectOption[]>(() => {
    const choices = roleChoices(false);
    return choices.map((r) => {
      const meta = roleMeta[r];
      if (r === "admin" && !adminCheck.enabled) {
        return {
          value: r,
          label: `${meta.label} (${copy.roleDialog.adminDisabled})`,
          disabled: true,
        };
      }
      return {
        value: r,
        label: meta.label,
      };
    });
  }, [adminCheck, copy.roleDialog.adminDisabled]);

  const handleUpdateRole = async () => {
    if (!details || savingRole || selectedRole === details.role) return;
    if (selectedRole === "admin" && !confirmAdmin) return;

    setSavingRole(true);
    try {
      const res = await changeMemberRolesAction({
        ids: [details.userId],
        role: selectedRole,
        confirmAdmin: selectedRole === "admin" ? confirmAdmin : undefined,
      });

      if (!res.ok) {
        const errKey = res.error || "failed";
        notify.error(
          copy.errors[errKey as keyof typeof copy.errors] || copy.errors.failed
        );
        return;
      }

      notify.success(copy.results.roleChanged(1));
      onChanged();
      await fetchDetails(details.userId);
    } catch {
      notify.error(copy.errors.failed);
    } finally {
      setSavingRole(false);
    }
  };

  const handleSaveNote = async () => {
    if (!details || !details.registrationId || savingNote) return;
    setSavingNote(true);
    try {
      const res = await saveNoteAction({
        id: details.registrationId,
        note: note.trim(),
      });
      if (res.ok) {
        setDetails((prev) =>
          prev ? { ...prev, adminNote: note.trim() || null } : null
        );
        notify.success(copy.drawer.noteSaved);
        onChanged();
      } else {
        const errKey = res.error || "failed";
        notify.error(
          copy.errors[errKey as keyof typeof copy.errors] || copy.errors.failed
        );
      }
    } catch {
      notify.error(copy.errors.failed);
    } finally {
      setSavingNote(false);
    }
  };

  const handleConfirmActive = async () => {
    if (!details || confirmActive === null) return;
    try {
      const res = await setMembersActiveAction({
        ids: [details.userId],
        active: confirmActive,
      });

      if (!res.ok) {
        const errKey = res.error || "failed";
        notify.error(
          copy.errors[errKey as keyof typeof copy.errors] || copy.errors.failed
        );
        return;
      }

      notify.success(copy.results.activeChanged(1, confirmActive));
      onChanged();
      await fetchDetails(details.userId);
    } catch {
      notify.error(copy.errors.failed);
    } finally {
      setConfirmActive(null);
    }
  };

  const handleConfirmRemove = async () => {
    if (!details) return;
    try {
      const res = await removeMemberAction({ id: details.userId });
      if (!res.ok) {
        const errKey = res.error || "failed";
        notify.error(
          copy.errors[errKey as keyof typeof copy.errors] || copy.errors.failed
        );
        return;
      }

      notify.success(copy.results.removed);
      onChanged();
      onClose();
    } catch {
      notify.error(copy.errors.failed);
    } finally {
      setConfirmRemoveOpen(false);
    }
  };

  const handleSavePublicTitle = async () => {
    if (!details) return;
    setSavingPublicTitle(true);
    setPublicTitleError(null);
    try {
      const res = await setMemberPublicTitleAction({
        userId: details.userId,
        title: publicTitleInput.trim() || null,
      });
      if (!res.ok) {
        const errKey = res.error as keyof typeof copy.errors;
        const msg = (errKey && copy.errors[errKey]) || copy.errors.failed;
        notify.error(msg);
        setPublicTitleError(msg);
      } else {
        notify.success(copy.drawer.titleSaved);
        setPublicTitleInfo((prev) =>
          prev ? { ...prev, publicTitle: res.title ?? null } : null
        );
        setPublicTitleInput(res.title ?? "");
        onChanged();
      }
    } catch {
      notify.error(copy.errors.failed);
      setPublicTitleError(copy.errors.failed);
    } finally {
      setSavingPublicTitle(false);
    }
  };

  const name = details
    ? details.fullName || details.email || "(no name)"
    : "";

  const uniLabel = details?.university
    ? universities.find((u) => u.value === details.university)?.label ||
      details.university
    : "-";

  const formattedPhone = details?.phoneNumber
    ? [details.phoneCountryCode, details.phoneNumber].filter(Boolean).join(" ")
    : "-";

  const externalLinks = React.useMemo(() => {
    if (!details) return [];
    const list: { label: string; url: string; icon: React.ReactNode }[] = [];
    if (details.linkedinUrl) {
      list.push({
        label: "LinkedIn",
        url: details.linkedinUrl,
        icon: <FaLinkedin className="size-4 shrink-0" aria-hidden="true" />,
      });
    }
    if (details.githubUrl) {
      list.push({
        label: "GitHub",
        url: details.githubUrl,
        icon: <FaGithub className="size-4 shrink-0" aria-hidden="true" />,
      });
    }
    if (details.websiteUrl) {
      list.push({
        label: "Website",
        url: details.websiteUrl,
        icon: <Globe className="size-4 shrink-0" aria-hidden="true" />,
      });
    }
    if (details.instagramUrl) {
      list.push({
        label: "Instagram",
        url: details.instagramUrl,
        icon: <FaInstagram className="size-4 shrink-0" aria-hidden="true" />,
      });
    }
    if (details.youtubeUrl) {
      list.push({
        label: "YouTube",
        url: details.youtubeUrl,
        icon: <FaYoutube className="size-4 shrink-0" aria-hidden="true" />,
      });
    }
    return list;
  }, [details]);

  return (
    <>
      <DetailDrawer
        open={Boolean(userId)}
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
        title={copy.drawer.title}
        description={name || copy.drawer.title}
        footer={
          details ? (
            <div className="flex w-full items-center justify-between gap-3">
              {isSelf ? (
                <p className="text-[13px] text-muted-foreground mr-auto">
                  {copy.removeDialog.self}
                </p>
              ) : isAdmin ? (
                <p className="text-[13px] text-muted-foreground mr-auto">
                  {copy.removeDialog.demoteFirst}
                </p>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setConfirmRemoveOpen(true)}
                  className="h-10 px-4 text-red-400 border-red-400/40 hover:bg-red-400/10 font-medium cursor-pointer ml-auto"
                >
                  {copy.actions.remove}
                </Button>
              )}
            </div>
          ) : undefined
        }
      >
        {loading ? (
          <div className="space-y-4 py-6">
            <div className="h-20 rounded-lg bg-card/60 animate-pulse border border-border" />
            <div className="h-32 rounded-lg bg-card/60 animate-pulse border border-border" />
            <div className="h-36 rounded-lg bg-card/60 animate-pulse border border-border" />
            <div className="h-32 rounded-lg bg-card/60 animate-pulse border border-border" />
          </div>
        ) : loadError ? (
          <div className="py-12 text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              {copy.drawer.loadFailed}
            </p>
            {userId && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fetchDetails(userId)}
                className="cursor-pointer"
              >
                {copy.drawer.retry}
              </Button>
            )}
          </div>
        ) : !details ? null : (
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
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <RoleBadge role={details.role} />
                <StatusBadge
                  tone={
                    statusTones[details.isActive ? "active" : "inactive"] ??
                    "muted"
                  }
                >
                  {details.isActive ? copy.filters.active : copy.filters.inactive}
                </StatusBadge>
              </div>
            </div>

            {/* Contact */}
            <DrawerSection icon={Mail} title={copy.drawer.sections.contact}>
              <DetailRow label={copy.drawer.labels.email}>
                {details.email ? (
                  <a
                    href={`mailto:${details.email}`}
                    className="text-primary hover:underline underline-offset-4"
                  >
                    {details.email}
                  </a>
                ) : (
                  "-"
                )}
              </DetailRow>
              <DetailRow label={copy.drawer.labels.phone}>
                {formattedPhone}
              </DetailRow>
            </DrawerSection>

            {/* Personal Information */}
            <DrawerSection icon={User} title={copy.drawer.sections.personal}>
              <DetailRow label={copy.drawer.labels.regNo}>
                <span className="font-mono text-[13.5px]">
                  {details.registrationNumber || "-"}
                </span>
              </DetailRow>
              <DetailRow label={copy.drawer.labels.gender}>
                {details.gender || "-"}
              </DetailRow>
              <DetailRow label={copy.drawer.labels.headline}>
                {details.headline || "-"}
              </DetailRow>
              <DetailRow label={copy.drawer.labels.location}>
                {details.location || "-"}
              </DetailRow>
            </DrawerSection>

            {/* Academic Information */}
            <DrawerSection
              icon={GraduationCap}
              title={copy.drawer.sections.academic}
            >
              <DetailRow label={copy.drawer.labels.university}>
                {uniLabel}
              </DetailRow>
              <DetailRow label={copy.drawer.labels.programme}>
                {programmeLabel(
                  details.programme,
                  details.department,
                  departments
                )}
              </DetailRow>
              <DetailRow label={copy.drawer.labels.department}>
                {departmentLabel(details.department, departments)}
              </DetailRow>
              <DetailRow label={copy.drawer.labels.year}>
                {details.studyYear || "-"}
              </DetailRow>
              <DetailRow label={copy.drawer.labels.semester}>
                {details.semester || "-"}
              </DetailRow>
              <DetailRow label={copy.drawer.labels.graduation}>
                {details.graduationYear ? String(details.graduationYear) : "-"}
              </DetailRow>
              <DetailRow label={copy.drawer.labels.memberSince}>
                {details.memberSince
                  ? formatIst(details.memberSince, { withTime: false })
                  : "-"}
              </DetailRow>
            </DrawerSection>

            {/* Skills & Interests */}
            <DrawerSection icon={Sparkles} title={copy.drawer.sections.skills}>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <span className="text-[12.5px] font-medium text-muted-foreground">
                    {copy.drawer.labels.skills}
                  </span>
                  {details.skills && details.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {details.skills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex h-6 items-center rounded border border-accent/30 bg-card/60 px-2.5 text-[11.5px] text-foreground leading-none"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[13px] text-muted-foreground">
                      {copy.drawer.labels.none}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5 pt-1">
                  <span className="text-[12.5px] font-medium text-muted-foreground">
                    {copy.drawer.labels.interests}
                  </span>
                  {details.interests && details.interests.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {details.interests.map((interest) => (
                        <span
                          key={interest}
                          className="inline-flex h-6 items-center rounded border border-accent/30 bg-card/60 px-2.5 text-[11.5px] text-foreground leading-none"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[13px] text-muted-foreground">
                      {copy.drawer.labels.none}
                    </p>
                  )}
                </div>
              </div>
            </DrawerSection>

            {/* Links */}
            <DrawerSection icon={Globe} title={copy.drawer.labels.links}>
              {externalLinks.length > 0 ? (
                <div className="space-y-2 pt-1">
                  {externalLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-md border border-border bg-card/40 px-3 py-2 text-[13.5px] text-foreground hover:border-primary/40 hover:text-white transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {link.icon}
                        <span className="font-medium">{link.label}</span>
                      </div>
                      <ExternalLink
                        className="size-3.5 text-muted-foreground"
                        aria-hidden="true"
                      />
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-[13px] text-muted-foreground">
                  {copy.drawer.labels.none}
                </p>
              )}
            </DrawerSection>

            {/* Role Management */}
            <DrawerSection
              icon={ShieldCheck}
              title={copy.drawer.sections.access}
            >
              <div className="space-y-4">
                <DetailRow label={copy.drawer.currentRole}>
                  <RoleBadge role={details.role} />
                </DetailRow>

                {isSelf ? (
                  <p className="text-[13px] text-muted-foreground pt-1 border-t border-border">
                    {copy.removeDialog.self}
                  </p>
                ) : (
                  <>
                    <div className="space-y-3 pt-2 border-t border-border">
                      <SelectField
                        id="drawer-change-role-select"
                        label={copy.drawer.newRole}
                        value={selectedRole}
                        onChange={(e) =>
                          setSelectedRole(e.target.value as AppRole)
                        }
                        options={roleOptions}
                        disabled={savingRole}
                      />

                      {selectedRole === "admin" && (
                        <div className="space-y-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
                          <p className="text-[12px] text-muted-foreground leading-relaxed">
                            {copy.roleDialog.adminText}
                          </p>
                          <CheckboxField
                            id="drawer-admin-confirm"
                            label={copy.roleDialog.adminConfirm}
                            checked={confirmAdmin}
                            onChange={(e) => setConfirmAdmin(e.target.checked)}
                            disabled={savingRole}
                          />
                        </div>
                      )}

                      <div className="flex justify-end pt-1">
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleUpdateRole}
                          disabled={
                            savingRole ||
                            selectedRole === details.role ||
                            (selectedRole === "admin" && !confirmAdmin)
                          }
                          className="h-9 px-3.5 bg-primary text-background hover:bg-primary-hover font-semibold text-[13px] cursor-pointer"
                        >
                          {savingRole ? (
                            <>
                              <LoaderCircle className="size-3.5 animate-spin mr-1.5 shrink-0" />
                              <span>{copy.roleDialog.working}</span>
                            </>
                          ) : (
                            copy.drawer.updateRole
                          )}
                        </Button>
                      </div>
                    </div>

                    {isAdmin ? (
                      <p className="text-[12.5px] text-muted-foreground pt-2 border-t border-border">
                        {copy.removeDialog.demoteFirst}
                      </p>
                    ) : (
                      <div className="pt-3 border-t border-border space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[13.5px] font-medium text-white">
                            {copy.drawer.activeLabel}
                          </span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={details.isActive}
                            aria-label={copy.drawer.activeLabel}
                            onClick={() =>
                              setConfirmActive(!details.isActive)
                            }
                            className={cn(
                              "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ring-offset-background",
                              details.isActive
                                ? "bg-primary"
                                : "bg-card border-border"
                            )}
                          >
                            <span
                              aria-hidden="true"
                              className={cn(
                                "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                                details.isActive
                                  ? "translate-x-5"
                                  : "translate-x-0"
                              )}
                            />
                          </button>
                        </div>
                        <p className="text-[12px] text-muted-foreground">
                          {copy.drawer.activeHelp}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </DrawerSection>

            {/* Public profile */}
            <DrawerSection
              icon={Globe}
              title={copy.drawer.sections.publicProfile}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-muted-foreground">
                    {copy.drawer.publicStatus}:
                  </span>
                  <span
                    className={cn(
                      "font-medium",
                      publicTitleInfo?.isPublicProfile
                        ? "text-emerald-400"
                        : "text-muted-foreground"
                    )}
                  >
                    {publicTitleInfo?.isPublicProfile
                      ? copy.drawer.publicYes
                      : copy.drawer.publicNo}
                  </span>
                </div>

                {details.registrationStatus === "approved" ? (
                  <div className="space-y-2 pt-2 border-t border-border">
                    <TextField
                      label={copy.drawer.publicTitle}
                      maxLength={80}
                      value={publicTitleInput}
                      onChange={(e) => {
                        setPublicTitleInput(e.target.value);
                        setPublicTitleError(null);
                      }}
                      placeholder={copy.drawer.publicTitle}
                      hint={copy.drawer.publicTitleHint}
                      error={publicTitleError ?? undefined}
                      disabled={savingPublicTitle}
                    />
                    <div className="flex justify-end pt-1">
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleSavePublicTitle}
                        disabled={
                          savingPublicTitle ||
                          (publicTitleInput.trim() || null) ===
                            (publicTitleInfo?.publicTitle ?? null)
                        }
                        className="h-8 px-3 text-[12.5px] bg-primary text-background hover:bg-primary-hover font-semibold cursor-pointer"
                      >
                        {savingPublicTitle ? (
                          <>
                            <LoaderCircle className="size-3.5 animate-spin mr-1.5 shrink-0" />
                            <span>{copy.drawer.savingTitle}</span>
                          </>
                        ) : (
                          <>
                            <Save className="size-3.5 mr-1.5 shrink-0" />
                            <span>{copy.drawer.saveTitle}</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-[12.5px] text-muted-foreground pt-2 border-t border-border">
                    {copy.drawer.notApproved}
                  </p>
                )}
              </div>
            </DrawerSection>

            {/* Notes */}
            <DrawerSection
              icon={ClipboardList}
              title={copy.drawer.sections.notes}
            >
              {!details.registrationId ? (
                <p className="text-[13px] text-muted-foreground">
                  {copy.drawer.noNotes}
                </p>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[12.5px] font-medium text-white">
                    <label htmlFor="member-drawer-notes">
                      {copy.drawer.noteLabel}
                    </label>
                    <span className="text-[11.5px] text-muted-foreground font-normal">
                      {note.length} / 2000
                    </span>
                  </div>
                  <textarea
                    id="member-drawer-notes"
                    rows={4}
                    value={note}
                    maxLength={2000}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={copy.drawer.notePlaceholder}
                    disabled={savingNote}
                    className={cn(
                      fieldClass,
                      "h-auto py-2.5 resize-none leading-relaxed"
                    )}
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
              )}
            </DrawerSection>
          </div>
        )}
      </DetailDrawer>

      {/* Confirmation for Active toggle from Drawer */}
      <ConfirmDialog
        open={confirmActive !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmActive(null);
        }}
        title={
          confirmActive
            ? copy.activeDialog.activateTitle(1)
            : copy.activeDialog.deactivateTitle(1)
        }
        description={
          confirmActive
            ? copy.activeDialog.activateText
            : copy.activeDialog.deactivateText
        }
        confirmLabel={
          confirmActive
            ? copy.activeDialog.confirmActivate
            : copy.activeDialog.confirmDeactivate
        }
        onConfirm={handleConfirmActive}
      />

      {/* Confirmation for Remove from Drawer */}
      <ConfirmDialog
        open={confirmRemoveOpen}
        onOpenChange={setConfirmRemoveOpen}
        title={copy.removeDialog.title}
        description={copy.removeDialog.text}
        confirmLabel={copy.removeDialog.confirm}
        tone="danger"
        onConfirm={handleConfirmRemove}
      />
    </>
  );
}
