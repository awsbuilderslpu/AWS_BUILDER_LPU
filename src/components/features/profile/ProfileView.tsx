"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Camera,
  Image as ImageIcon,
  MapPin,
  ExternalLink,
  Lock,
  AlertCircle,
  LoaderCircle,
  Save,
  X,
  Pencil,
  Globe,
  Check,
  Share2,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  Mail,
  Phone,
  Calendar,
  IdCard,
  UserCheck,
  CheckCircle2,
  Eye,
  EyeOff,
  Layers,
  ArrowUpRight,
  BookOpen,
} from "lucide-react";
import {
  FaGithub,
  FaLinkedin,
  FaInstagram,
  FaYoutube,
} from "react-icons/fa6";

import type { AccountSummary } from "@/lib/auth/account";
import type { OwnProfile } from "@/lib/profile/types";
import { profileCopy } from "@/data/profile";
import { roleMeta, type Role } from "@/data/roles";
import {
  universities,
  programmes,
  departments,
  yearOptions,
  semesterOptions,
  interestOptions,
  countryCodes,
  registrationConstants,
} from "@/data/registration";
import { formFromOwnProfile, formatDob } from "@/lib/profile/view-logic";
import {
  profileFormSchema,
  type ProfileFormValues,
  type ProfileFormInput,
} from "@/lib/profile/validate";
import {
  updateOwnProfileAction,
  setOwnMediaAction,
  setOwnPublicProfileAction,
} from "@/lib/profile/actions";
import { notify } from "@/lib/admin/notify";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/TextField";
import { SelectField } from "@/components/ui/SelectField";
import { PhoneField } from "@/components/ui/PhoneField";
import { TagInput } from "@/components/features/admin/forms/TagInput";
import { ImageUpload } from "@/components/features/admin/forms/ImageUpload";
import { RoleBadge } from "@/components/features/admin/kit/RoleBadge";
import {
  StatusBadge,
  statusTones,
} from "@/components/features/admin/kit/StatusBadge";
import { Avatar } from "@/components/ui/Avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface ProfileViewProps {
  account: AccountSummary;
  profile: OwnProfile;
  media: {
    avatarUrl: string | null;
    coverUrl: string | null;
  };
  requestedRole: string | null;
}

export function ProfileView({
  account,
  profile,
  media,
  requestedRole,
}: ProfileViewProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = React.useState(false);
  const [savingForm, setSavingForm] = React.useState(false);

  // Media dialog states
  const [avatarDialogOpen, setAvatarDialogOpen] = React.useState(false);
  const [coverDialogOpen, setCoverDialogOpen] = React.useState(false);

  // Public switch state
  const isApproved = account.registrationStatus === "approved";
  const [isPublic, setIsPublic] = React.useState(profile.isPublicProfile);
  const [switchingPublic, setSwitchingPublic] = React.useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ProfileFormInput, unknown, ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: formFromOwnProfile(profile),
  });

  const bioRaw = watch("bio");
  const bioValue = typeof bioRaw === "string" ? bioRaw : "";

  // Completeness score
  const completeness = React.useMemo(() => {
    const checks = [
      { label: "Profile photo", done: Boolean(media.avatarUrl || profile.avatarPath), weight: 15 },
      { label: "Cover banner", done: Boolean(media.coverUrl || profile.coverPath), weight: 10 },
      { label: "About / Bio", done: Boolean(profile.bio && profile.bio.trim().length > 0), weight: 15 },
      { label: "Professional headline", done: Boolean(profile.headline && profile.headline.trim().length > 0), weight: 10 },
      { label: "Skills (at least 1)", done: Boolean(profile.skills && profile.skills.length > 0), weight: 20 },
      { label: "Academic information", done: Boolean(profile.university && profile.programme && profile.department), weight: 15 },
      { label: "Location", done: Boolean(profile.location && profile.location.trim().length > 0), weight: 5 },
      { label: "Social profile link", done: Boolean(profile.githubUrl || profile.linkedinUrl || profile.websiteUrl), weight: 10 },
    ];
    const score = checks.reduce((sum, item) => sum + (item.done ? item.weight : 0), 0);
    const nextItem = checks.find((item) => !item.done);
    return { score, nextItem };
  }, [media.avatarUrl, media.coverUrl, profile]);

  const handleTogglePublic = async () => {
    if (!isApproved || switchingPublic) return;
    const nextState = !isPublic;
    setSwitchingPublic(true);
    try {
      const res = await setOwnPublicProfileAction({ enabled: nextState });
      if (res.ok) {
        setIsPublic(nextState);
        notify.success(
          nextState
            ? profileCopy.messages.publicOn
            : profileCopy.messages.publicOff
        );
      } else {
        notify.error(profileCopy.errors.update_failed);
      }
    } catch {
      notify.error(profileCopy.errors.failed);
    } finally {
      setSwitchingPublic(false);
    }
  };

  const handleSaveAvatar = async (path: string | null) => {
    try {
      const res = await setOwnMediaAction({ kind: "avatar", path });
      if (res.ok) {
        notify.success(profileCopy.messages.mediaSaved);
        setAvatarDialogOpen(false);
        router.refresh();
      } else {
        notify.error(profileCopy.errors.update_failed);
      }
    } catch {
      notify.error(profileCopy.errors.failed);
    }
  };

  const handleSaveCover = async (path: string | null) => {
    try {
      const res = await setOwnMediaAction({ kind: "cover", path });
      if (res.ok) {
        notify.success(profileCopy.messages.coverSaved);
        setCoverDialogOpen(false);
        router.refresh();
      } else {
        notify.error(profileCopy.errors.update_failed);
      }
    } catch {
      notify.error(profileCopy.errors.failed);
    }
  };

  const onSubmit = async (values: ProfileFormValues) => {
    setSavingForm(true);
    try {
      const res = await updateOwnProfileAction(values);
      if (res.ok) {
        notify.success(profileCopy.messages.saved);
        setIsEditing(false);
        router.refresh();
      } else {
        const errKey = res.error as keyof typeof profileCopy.errors;
        notify.error(profileCopy.errors[errKey] || profileCopy.errors.failed);
      }
    } catch {
      notify.error(profileCopy.errors.failed);
    } finally {
      setSavingForm(false);
    }
  };

  const handleCancel = () => {
    reset(formFromOwnProfile(profile));
    setIsEditing(false);
  };

  const handleShare = async () => {
    try {
      if (typeof window !== "undefined") {
        await navigator.clipboard.writeText(window.location.href);
        notify.success("Profile link copied to clipboard!");
      }
    } catch {
      notify.error("Could not copy link");
    }
  };

  // Options for academic selects
  const currentYear = new Date().getFullYear();
  const graduationYearOptions = Array.from(
    { length: registrationConstants.graduationSpan + 1 },
    (_, i) => {
      const y = String(currentYear + i);
      return { value: y, label: y };
    }
  );

  const displayRoleTitle =
    profile.publicTitle ||
    (account.role && roleMeta[account.role as Role]?.label) ||
    "Member";

  const currentUni =
    universities.find((u) => u.value === profile.university)?.label ||
    profile.university ||
    "-";

  const currentDept =
    departments.find((d) => d.value === profile.department)?.label ||
    profile.department ||
    "-";

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-8 space-y-6">
      {/* Hero Header Card */}
      <div className="rounded-2xl border border-border/80 bg-card/70 overflow-hidden backdrop-blur-md shadow-xl transition-all">
        {/* Cover Area */}
        <div className="relative h-[180px] sm:h-[230px] w-full overflow-hidden bg-slate-950">
          {media.coverUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element -- private bucket signed URL */
            <img
              src={media.coverUrl}
              alt="Profile cover"
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              aria-hidden="true"
              className="h-full w-full bg-gradient-to-r from-primary/30 via-slate-900 to-indigo-950 relative"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,153,0,0.15),transparent_50%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px]" />
            </div>
          )}

          {/* Cover Change Button */}
          <button
            type="button"
            onClick={() => setCoverDialogOpen(true)}
            className="absolute top-3.5 right-3.5 inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md transition-all hover:bg-black/80 hover:border-primary/60 cursor-pointer shadow-lg"
          >
            <ImageIcon className="size-3.5 text-primary" aria-hidden="true" />
            <span>{profileCopy.actions.uploadCover}</span>
          </button>
        </div>

        {/* Header Content with Overlapping Avatar */}
        <div className="px-6 pb-6 pt-0">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 -mt-16 sm:-mt-20 relative z-10">
            {/* Avatar & Main Identity */}
            <div className="flex flex-col sm:flex-row sm:items-end gap-5">
              {/* Avatar circle with glow border */}
              <div className="relative size-32 sm:size-36 shrink-0 rounded-full border-4 border-card bg-card shadow-2xl overflow-hidden ring-2 ring-primary/40 group">
                {media.avatarUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element -- private bucket signed URL */
                  <img
                    src={media.avatarUrl}
                    alt={account.displayName || "Avatar"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-slate-900">
                    <Avatar name={account.displayName} size={130} />
                  </div>
                )}

                {/* Change Photo Overlay Button */}
                <button
                  type="button"
                  aria-label={profileCopy.actions.uploadAvatar}
                  onClick={() => setAvatarDialogOpen(true)}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white backdrop-blur-xs gap-1"
                >
                  <Camera className="size-6 text-primary drop-shadow" aria-hidden="true" />
                  <span className="text-[10px] font-medium tracking-wide uppercase">Change</span>
                </button>
              </div>

              {/* Name, Badges, and Headline */}
              <div className="sm:mb-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                    {account.displayName || account.email}
                  </h1>
                  {account.role && (
                    <RoleBadge role={account.role as Role} />
                  )}
                  {account.registrationStatus === "approved" && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400">
                      <CheckCircle2 className="size-3" />
                      <span>Verified</span>
                    </span>
                  )}
                </div>

                <div className="text-sm sm:text-base font-semibold text-primary/95 flex items-center gap-2">
                  <span>{displayRoleTitle}</span>
                  {profile.headline && (
                    <>
                      <span className="text-border">•</span>
                      <span className="text-sm font-normal text-muted-foreground truncate max-w-md">
                        {profile.headline}
                      </span>
                    </>
                  )}
                </div>

                {/* Quick Meta Chips */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-xs text-muted-foreground">
                  {profile.university && (
                    <span className="inline-flex items-center gap-1.5">
                      <GraduationCap className="size-3.5 text-primary shrink-0" />
                      <span className="truncate max-w-[260px]">{currentUni}</span>
                    </span>
                  )}
                  {profile.location && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="size-3.5 text-primary shrink-0" />
                      <span>{profile.location}</span>
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="size-3.5 text-muted-foreground/70 shrink-0" />
                    <span>{account.email}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="sm:mb-1 shrink-0 flex flex-wrap items-center gap-2.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="h-9 px-3 text-xs border-border/80 bg-card/60 hover:bg-card hover:border-primary/50 text-muted-foreground hover:text-white cursor-pointer"
              >
                <Share2 className="size-3.5 mr-1.5" />
                <span>Share</span>
              </Button>

              {isPublic && isApproved && (
                <Link
                  href="/members"
                  className="inline-flex h-9 items-center justify-center rounded-md border border-border/80 bg-card/60 px-3 text-xs font-medium text-muted-foreground hover:text-white hover:border-primary/50 transition-colors"
                >
                  <ArrowUpRight className="size-3.5 mr-1 text-primary" />
                  <span>Public Directory</span>
                </Link>
              )}

              {isEditing ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    disabled={savingForm}
                    className="h-9 px-3.5 text-xs font-semibold cursor-pointer border-border hover:border-red-500/50 hover:text-red-400"
                  >
                    <X className="size-3.5 mr-1.5" />
                    <span>{profileCopy.actions.cancel}</span>
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleSubmit(onSubmit)}
                    disabled={savingForm}
                    className="h-9 px-4 text-xs bg-primary text-background hover:bg-primary-hover font-semibold cursor-pointer shadow-lg shadow-primary/20"
                  >
                    {savingForm ? (
                      <>
                        <LoaderCircle className="size-3.5 animate-spin mr-1.5" />
                        <span>{profileCopy.actions.saving}</span>
                      </>
                    ) : (
                      <>
                        <Save className="size-3.5 mr-1.5" />
                        <span>{profileCopy.actions.save}</span>
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="h-9 px-4 text-xs font-semibold bg-primary text-background hover:bg-primary-hover transition-all cursor-pointer shadow-md shadow-primary/20 hover:scale-[1.02]"
                >
                  <Pencil className="size-3.5 mr-1.5" />
                  <span>{profileCopy.actions.edit}</span>
                </Button>
              )}
            </div>
          </div>

          {/* Profile Completeness Strip */}
          <div className="mt-5 pt-4 border-t border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3 w-full sm:max-w-md">
              <span className="font-semibold text-white shrink-0">Profile Completion:</span>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-amber-400 transition-all duration-500"
                  style={{ width: `${completeness.score}%` }}
                />
              </div>
              <span className="font-mono font-bold text-primary shrink-0">{completeness.score}%</span>
            </div>

            <div className="text-muted-foreground text-xs">
              {completeness.score === 100 ? (
                <span className="text-emerald-400 font-medium inline-flex items-center gap-1">
                  <CheckCircle2 className="size-3.5" />
                  Profile complete & ready for community highlights!
                </span>
              ) : completeness.nextItem ? (
                <span>
                  Tip: Add <span className="text-white font-medium">{completeness.nextItem.label}</span> to boost your profile presence.
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Incomplete Registration Notice */}
      {!account.profileComplete && (
        <div
          role="alert"
          className="flex items-center justify-between gap-4 rounded-xl border border-primary/40 bg-primary/10 p-4 text-xs sm:text-sm text-foreground backdrop-blur-sm shadow-md"
        >
          <div className="flex items-center gap-2.5">
            <AlertCircle className="size-4 text-primary shrink-0" aria-hidden="true" />
            <span>{profileCopy.notices.incomplete}</span>
          </div>
          <Link
            href="?auth=complete"
            scroll={false}
            className="shrink-0 inline-flex items-center gap-1 font-semibold text-primary hover:underline"
          >
            <span>{profileCopy.notices.finish}</span>
            <ExternalLink className="size-3" aria-hidden="true" />
          </Link>
        </div>
      )}

      {/* Quick Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-xl border border-border/80 bg-card/50 p-4 backdrop-blur-xs flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
            <ShieldCheck className="size-5" />
          </div>
          <div className="min-w-0">
            <span className="block text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Access Role</span>
            <span className="font-semibold text-sm text-white capitalize truncate block">
              {account.role || "Member"}
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-border/80 bg-card/50 p-4 backdrop-blur-xs flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <UserCheck className="size-5" />
          </div>
          <div className="min-w-0">
            <span className="block text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Membership</span>
            <span className="font-semibold text-sm text-white capitalize truncate block">
              {account.registrationStatus || "Active"}
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-border/80 bg-card/50 p-4 backdrop-blur-xs flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Layers className="size-5" />
          </div>
          <div className="min-w-0">
            <span className="block text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Skills & Focus</span>
            <span className="font-semibold text-sm text-white truncate block">
              {profile.skills.length > 0 ? `${profile.skills.length} Mastered` : "None added"}
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-border/80 bg-card/50 p-4 backdrop-blur-xs flex items-center gap-3.5">
          <div className={cn(
            "p-2.5 rounded-lg border",
            isPublic ? "bg-primary/10 text-primary border-primary/20" : "bg-muted text-muted-foreground border-border"
          )}>
            {isPublic ? <Eye className="size-5" /> : <EyeOff className="size-5" />}
          </div>
          <div className="min-w-0">
            <span className="block text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Public Directory</span>
            <span className="font-semibold text-sm text-white truncate block">
              {isPublic ? "Visible" : "Private"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Personal, Identity & Social (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Card: Personal Details & Contact */}
            <div className="rounded-xl border border-border/80 bg-card/60 p-6 backdrop-blur-sm space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-border/70 pb-3">
                <div className="flex items-center gap-2">
                  <UserCheck className="size-4 text-primary" />
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                    {profileCopy.sections.personal}
                  </h2>
                </div>
              </div>

              <div className="space-y-4">
                {isEditing ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <TextField
                      id="profile-first-name"
                      label={profileCopy.labels.firstName}
                      required
                      error={errors.firstName?.message}
                      {...register("firstName")}
                    />
                    <TextField
                      id="profile-last-name"
                      label={profileCopy.labels.lastName}
                      required
                      error={errors.lastName?.message}
                      {...register("lastName")}
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm">
                    <div>
                      <span className="block text-muted-foreground font-medium mb-1">
                        {profileCopy.labels.firstName}
                      </span>
                      <span className="text-foreground font-semibold">
                        {profile.firstName || "-"}
                      </span>
                    </div>
                    <div>
                      <span className="block text-muted-foreground font-medium mb-1">
                        {profileCopy.labels.lastName}
                      </span>
                      <span className="text-foreground font-semibold">
                        {profile.lastName || "-"}
                      </span>
                    </div>
                  </div>
                )}

                {/* Email (Read-Only) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12.5px] font-medium text-white flex items-center gap-1.5">
                      <Mail className="size-3.5 text-muted-foreground" />
                      <span>{profileCopy.labels.email}</span>
                    </span>
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded border border-border">
                      Primary
                    </span>
                  </div>
                  <input
                    id="profile-email-readonly"
                    type="email"
                    value={account.email}
                    readOnly
                    disabled
                    className="w-full h-10 rounded-md border border-border/80 bg-card/30 px-3 text-[13px] text-muted-foreground cursor-not-allowed select-none"
                  />
                </div>

                {/* Phone */}
                {isEditing ? (
                  <PhoneField
                    id="profile-phone-input"
                    label={profileCopy.labels.phone}
                    required
                    error={errors.phoneNumber?.message}
                    selectProps={register("phoneCountryCode")}
                    inputProps={register("phoneNumber")}
                    codes={countryCodes}
                    selectLabel="Country code"
                  />
                ) : (
                  <div className="text-xs sm:text-sm">
                    <span className="block text-muted-foreground font-medium mb-1 flex items-center gap-1.5">
                      <Phone className="size-3.5 text-muted-foreground" />
                      <span>{profileCopy.labels.phone}</span>
                    </span>
                    <span className="text-foreground font-semibold">
                      {profile.phoneNumber
                        ? `${profile.phoneCountryCode || "+91"} ${profile.phoneNumber}`
                        : "-"}
                    </span>
                  </div>
                )}

                {/* Verified Student Credentials (Locked) */}
                <div className="rounded-lg border border-border/80 bg-background/50 p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] uppercase font-bold text-primary flex items-center gap-1.5 tracking-wider">
                      <IdCard className="size-3.5" />
                      <span>Institutional Credentials</span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground bg-card px-2 py-0.5 rounded border border-border">
                      <Lock className="size-2.5 text-amber-400" />
                      <span>Locked</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <span className="block text-[11px] text-muted-foreground mb-0.5">
                        {profileCopy.labels.registrationNumber}
                      </span>
                      <span className="font-mono text-xs font-semibold text-white">
                        {profile.registrationNumber || "-"}
                      </span>
                    </div>

                    <div>
                      <span className="block text-[11px] text-muted-foreground mb-0.5">
                        {profileCopy.labels.dateOfBirth}
                      </span>
                      <span className="text-xs font-semibold text-white flex items-center gap-1">
                        <Calendar className="size-3 text-muted-foreground" />
                        {formatDob(profile.dateOfBirth)}
                      </span>
                    </div>

                    <div>
                      <span className="block text-[11px] text-muted-foreground mb-0.5">
                        {profileCopy.labels.gender}
                      </span>
                      <span className="text-xs font-semibold text-white">
                        {profile.gender || "-"}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-muted-foreground/80 leading-relaxed pt-1 border-t border-border/50">
                    {profileCopy.hints.locked}
                  </p>
                </div>
              </div>
            </div>

            {/* Card: Web Presence & Socials */}
            <div className="rounded-xl border border-border/80 bg-card/60 p-6 backdrop-blur-sm space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-border/70 pb-3">
                <div className="flex items-center gap-2">
                  <Globe className="size-4 text-primary" />
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                    {profileCopy.labels.links}
                  </h2>
                </div>
              </div>

              {isEditing ? (
                <div className="space-y-3">
                  <TextField
                    id="profile-github"
                    label={profileCopy.labels.github}
                    inputMode="url"
                    placeholder="https://github.com/..."
                    error={errors.githubUrl?.message}
                    {...register("githubUrl")}
                  />
                  <TextField
                    id="profile-linkedin"
                    label={profileCopy.labels.linkedin}
                    inputMode="url"
                    placeholder="https://linkedin.com/in/..."
                    error={errors.linkedinUrl?.message}
                    {...register("linkedinUrl")}
                  />
                  <TextField
                    id="profile-website"
                    label={profileCopy.labels.website}
                    inputMode="url"
                    placeholder="https://..."
                    error={errors.websiteUrl?.message}
                    {...register("websiteUrl")}
                  />
                  <TextField
                    id="profile-instagram"
                    label={profileCopy.labels.instagram}
                    inputMode="url"
                    placeholder="https://instagram.com/..."
                    error={errors.instagramUrl?.message}
                    {...register("instagramUrl")}
                  />
                  <TextField
                    id="profile-youtube"
                    label={profileCopy.labels.youtube}
                    inputMode="url"
                    placeholder="https://youtube.com/@..."
                    error={errors.youtubeUrl?.message}
                    {...register("youtubeUrl")}
                  />
                </div>
              ) : (
                <div className="space-y-2 text-xs sm:text-sm">
                  {profile.githubUrl || profile.linkedinUrl || profile.websiteUrl || profile.instagramUrl || profile.youtubeUrl ? (
                    <div className="grid grid-cols-1 gap-2">
                      {profile.githubUrl && (
                        <a
                          href={profile.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between rounded-lg border border-border/80 bg-card/40 p-2.5 text-foreground hover:text-white hover:border-primary/50 transition-all group"
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <FaGithub className="size-4 shrink-0 text-white" />
                            <span className="truncate text-xs font-medium">{profile.githubUrl}</span>
                          </div>
                          <ExternalLink className="size-3 text-muted-foreground group-hover:text-primary shrink-0" />
                        </a>
                      )}
                      {profile.linkedinUrl && (
                        <a
                          href={profile.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between rounded-lg border border-border/80 bg-card/40 p-2.5 text-foreground hover:text-white hover:border-primary/50 transition-all group"
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <FaLinkedin className="size-4 shrink-0 text-[#0077b5]" />
                            <span className="truncate text-xs font-medium">{profile.linkedinUrl}</span>
                          </div>
                          <ExternalLink className="size-3 text-muted-foreground group-hover:text-primary shrink-0" />
                        </a>
                      )}
                      {profile.websiteUrl && (
                        <a
                          href={profile.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between rounded-lg border border-border/80 bg-card/40 p-2.5 text-foreground hover:text-white hover:border-primary/50 transition-all group"
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <Globe className="size-4 shrink-0 text-primary" />
                            <span className="truncate text-xs font-medium">{profile.websiteUrl}</span>
                          </div>
                          <ExternalLink className="size-3 text-muted-foreground group-hover:text-primary shrink-0" />
                        </a>
                      )}
                      {profile.instagramUrl && (
                        <a
                          href={profile.instagramUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between rounded-lg border border-border/80 bg-card/40 p-2.5 text-foreground hover:text-white hover:border-primary/50 transition-all group"
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <FaInstagram className="size-4 shrink-0 text-[#E4405F]" />
                            <span className="truncate text-xs font-medium">{profile.instagramUrl}</span>
                          </div>
                          <ExternalLink className="size-3 text-muted-foreground group-hover:text-primary shrink-0" />
                        </a>
                      )}
                      {profile.youtubeUrl && (
                        <a
                          href={profile.youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between rounded-lg border border-border/80 bg-card/40 p-2.5 text-foreground hover:text-white hover:border-primary/50 transition-all group"
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <FaYoutube className="size-4 shrink-0 text-[#CD201F]" />
                            <span className="truncate text-xs font-medium">{profile.youtubeUrl}</span>
                          </div>
                          <ExternalLink className="size-3 text-muted-foreground group-hover:text-primary shrink-0" />
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 text-center rounded-lg border border-dashed border-border/80 text-muted-foreground text-xs">
                      <p>No social links added yet.</p>
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="mt-1.5 text-primary hover:underline font-medium cursor-pointer"
                      >
                        Add your links
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Card: Public Directory Visibility */}
            <div className="rounded-xl border border-border/80 bg-card/60 p-6 backdrop-blur-sm space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-border/70 pb-3">
                <div className="flex items-center gap-2">
                  <Eye className="size-4 text-primary" />
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                    {profileCopy.sections.public}
                  </h2>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <span className="block text-sm font-semibold text-white">
                      {profileCopy.hints.publicToggle}
                    </span>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      {profileCopy.hints.publicHelp}
                    </p>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={isPublic}
                    aria-label={profileCopy.hints.publicToggle}
                    disabled={!isApproved || switchingPublic}
                    onClick={handleTogglePublic}
                    className={cn(
                      "relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ring-offset-background",
                      !isApproved
                        ? "cursor-not-allowed opacity-50 bg-card border-border"
                        : isPublic
                        ? "bg-primary cursor-pointer shadow-md shadow-primary/30"
                        : "bg-slate-800 border-border cursor-pointer"
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                        isPublic ? "translate-x-5" : "translate-x-0"
                      )}
                    />
                  </button>
                </div>

                {!isApproved && (
                  <p className="text-xs text-amber-400/90 font-medium bg-amber-400/10 p-2.5 rounded-lg border border-amber-400/20">
                    {profileCopy.hints.publicNeedsApproval}
                  </p>
                )}

                {/* Directory Preview Mini-Card */}
                <div className="pt-2">
                  <span className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Directory Card Preview
                  </span>
                  <div className="rounded-lg border border-border/80 bg-background/60 p-3.5 space-y-2.5">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full overflow-hidden shrink-0 border border-border bg-card">
                        {media.avatarUrl ? (
                          /* eslint-disable-next-line @next/next/no-img-element -- private bucket signed URL */
                          <img
                            src={media.avatarUrl}
                            alt=""
                            className="size-full object-cover"
                          />
                        ) : (
                          <Avatar name={account.displayName} size={40} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-white block truncate">
                          {account.displayName || account.email}
                        </span>
                        <span className="text-[11px] text-primary font-medium block truncate">
                          {displayRoleTitle}
                        </span>
                      </div>
                    </div>
                    {profile.headline && (
                      <p className="text-[11px] text-muted-foreground line-clamp-2">
                        {profile.headline}
                      </p>
                    )}
                    {profile.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {profile.skills.slice(0, 3).map((s) => (
                          <span key={s} className="text-[9.5px] rounded bg-muted/60 border border-border px-1.5 py-0.5 text-muted-foreground">
                            {s}
                          </span>
                        ))}
                        {profile.skills.length > 3 && (
                          <span className="text-[9.5px] text-muted-foreground self-center">
                            +{profile.skills.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: About, Academics, Skills & Interests (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Card: About Me */}
            <div className="rounded-xl border border-border/80 bg-card/60 p-6 sm:p-8 backdrop-blur-sm space-y-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-border/70 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-primary" />
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                    {profileCopy.sections.about}
                  </h2>
                </div>
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <TextField
                    id="profile-headline-input"
                    label={profileCopy.labels.headline}
                    placeholder={profileCopy.placeholders.headline}
                    maxLength={120}
                    error={errors.headline?.message}
                    {...register("headline")}
                  />
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label
                        htmlFor="profile-bio-textarea"
                        className="block text-[12.5px] font-medium text-white"
                      >
                        {profileCopy.labels.bio}
                      </label>
                      <span className="text-[11px] text-muted-foreground">
                        {bioValue.length} / 1000
                      </span>
                    </div>
                    <textarea
                      id="profile-bio-textarea"
                      rows={5}
                      maxLength={1000}
                      placeholder={profileCopy.placeholders.bio}
                      className="w-full rounded-md border border-border bg-card/40 px-3 py-2 text-[13px] text-foreground placeholder:text-[12px] placeholder:text-muted-foreground/75 outline-none resize-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                      {...register("bio")}
                    />
                    {errors.bio && (
                      <p role="alert" className="mt-1 text-[12px] text-red-400">
                        {errors.bio.message}
                      </p>
                    )}
                  </div>
                  <TextField
                    id="profile-location-input"
                    label={profileCopy.labels.location}
                    placeholder={profileCopy.placeholders.location}
                    maxLength={120}
                    error={errors.location?.message}
                    {...register("location")}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                      {profileCopy.labels.headline}
                    </span>
                    <p className="text-sm sm:text-base text-white font-medium">
                      {profile.headline || (
                        <span className="text-muted-foreground italic">{profileCopy.labels.none}</span>
                      )}
                    </p>
                  </div>

                  <div>
                    <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                      {profileCopy.labels.bio}
                    </span>
                    <div className="rounded-lg border border-border/60 bg-background/40 p-4 text-xs sm:text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                      {profile.bio || (
                        <span className="text-muted-foreground italic">{profileCopy.labels.none}</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                      {profileCopy.labels.location}
                    </span>
                    <span className="text-xs sm:text-sm font-medium text-foreground inline-flex items-center gap-1.5">
                      <MapPin className="size-3.5 text-primary" />
                      <span>{profile.location || profileCopy.labels.none}</span>
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Card: Academic Journey */}
            <div className="rounded-xl border border-border/80 bg-card/60 p-6 sm:p-8 backdrop-blur-sm space-y-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-border/70 pb-3">
                <div className="flex items-center gap-2">
                  <GraduationCap className="size-4 text-primary" />
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                    {profileCopy.sections.academic}
                  </h2>
                </div>
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <SelectField
                    id="profile-university"
                    label={profileCopy.labels.university}
                    required
                    error={errors.university?.message}
                    options={universities}
                    {...register("university")}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <SelectField
                      id="profile-programme"
                      label={profileCopy.labels.programme}
                      required
                      error={errors.programme?.message}
                      options={programmes.map((p) => ({ value: p, label: p }))}
                      {...register("programme")}
                    />
                    <SelectField
                      id="profile-department"
                      label={profileCopy.labels.department}
                      required
                      error={errors.department?.message}
                      options={departments.map((d) => ({
                        value: d.value,
                        label: d.label,
                      }))}
                      {...register("department")}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <SelectField
                      id="profile-study-year"
                      label={profileCopy.labels.studyYear}
                      required
                      error={errors.studyYear?.message}
                      options={yearOptions.map((y) => ({ value: y, label: y }))}
                      {...register("studyYear")}
                    />
                    <SelectField
                      id="profile-semester"
                      label={profileCopy.labels.semester}
                      required
                      error={errors.semester?.message}
                      options={semesterOptions.map((s) => ({ value: s, label: s }))}
                      {...register("semester")}
                    />
                    <SelectField
                      id="profile-grad-year"
                      label={profileCopy.labels.graduationYear}
                      required
                      error={errors.graduationYear?.message}
                      options={graduationYearOptions}
                      {...register("graduationYear")}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20 shrink-0">
                      <BookOpen className="size-5" />
                    </div>
                    <div>
                      <span className="text-[11px] uppercase font-bold text-primary tracking-wider">Institution</span>
                      <h3 className="text-sm sm:text-base font-bold text-white mt-0.5">{currentUni}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {profile.programme || "-"} • {currentDept}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-lg border border-border/80 bg-background/50 p-3 text-center">
                      <span className="block text-[11px] text-muted-foreground font-medium mb-1">
                        {profileCopy.labels.studyYear}
                      </span>
                      <span className="text-sm font-bold text-white">
                        {profile.studyYear || "-"}
                      </span>
                    </div>
                    <div className="rounded-lg border border-border/80 bg-background/50 p-3 text-center">
                      <span className="block text-[11px] text-muted-foreground font-medium mb-1">
                        {profileCopy.labels.semester}
                      </span>
                      <span className="text-sm font-bold text-white">
                        {profile.semester || "-"}
                      </span>
                    </div>
                    <div className="rounded-lg border border-border/80 bg-background/50 p-3 text-center">
                      <span className="block text-[11px] text-muted-foreground font-medium mb-1">
                        {profileCopy.labels.graduationYear}
                      </span>
                      <span className="text-sm font-bold text-white">
                        {profile.graduationYear || "-"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Card: Skills & Technologies */}
            <div className="rounded-xl border border-border/80 bg-card/60 p-6 sm:p-8 backdrop-blur-sm space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-border/70 pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="size-4 text-primary" />
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                    {profileCopy.sections.skills}
                  </h2>
                </div>
                {!isEditing && profile.skills.length > 0 && (
                  <span className="text-xs text-primary font-mono font-semibold">
                    {profile.skills.length} skills
                  </span>
                )}
              </div>

              {isEditing ? (
                <Controller<ProfileFormInput, "skills">
                  control={control}
                  name="skills"
                  render={({ field }) => (
                    <TagInput
                      id="profile-skills-input"
                      label={profileCopy.labels.skills}
                      value={Array.isArray(field.value) ? (field.value as string[]) : []}
                      onChange={field.onChange}
                      maxTags={20}
                      hint={profileCopy.hints.skills}
                      error={errors.skills?.message}
                    />
                  )}
                />
              ) : (
                <div>
                  {profile.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-white transition-all hover:border-primary/60 hover:bg-primary/20"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center rounded-lg border border-dashed border-border/80 text-muted-foreground text-xs">
                      <p>No skills highlighted yet.</p>
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="mt-1.5 text-primary hover:underline font-medium cursor-pointer"
                      >
                        Add your key skills
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Card: Interests & Passions */}
            <div className="rounded-xl border border-border/80 bg-card/60 p-6 sm:p-8 backdrop-blur-sm space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-border/70 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-amber-400" />
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                    {profileCopy.sections.interests}
                  </h2>
                </div>
              </div>

              {isEditing ? (
                <Controller<ProfileFormInput, "interests">
                  control={control}
                  name="interests"
                  render={({ field }) => {
                    const selected = Array.isArray(field.value)
                      ? (field.value as string[])
                      : [];
                    const toggleInterest = (opt: string) => {
                      if (selected.includes(opt)) {
                        field.onChange(selected.filter((item) => item !== opt));
                      } else {
                        field.onChange([...selected, opt]);
                      }
                    };

                    return (
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {interestOptions.map((opt) => {
                            const isChecked = selected.includes(opt);
                            return (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => toggleInterest(opt)}
                                className={cn(
                                  "inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium transition-all cursor-pointer select-none",
                                  isChecked
                                    ? "border-primary bg-primary/15 text-primary shadow-xs"
                                    : "border-border bg-card/40 text-muted-foreground hover:text-white hover:border-primary/40"
                                )}
                              >
                                {isChecked && (
                                  <Check className="size-3 mr-1 shrink-0" aria-hidden="true" />
                                )}
                                <span>{opt}</span>
                              </button>
                            );
                          })}
                        </div>
                        {errors.interests && (
                          <p role="alert" className="text-[12px] text-red-400">
                            {errors.interests.message}
                          </p>
                        )}
                      </div>
                    );
                  }}
                />
              ) : (
                <div>
                  {profile.interests.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profile.interests.map((interest) => (
                        <span
                          key={interest}
                          className="inline-flex items-center rounded-full border border-border/80 bg-card/70 px-3.5 py-1 text-xs font-medium text-slate-200"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs sm:text-sm text-muted-foreground italic">
                      {profileCopy.labels.none}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sticky Floating Action Bar during Edit Mode */}
        {isEditing && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-full border border-primary/40 bg-card/95 px-5 py-2.5 shadow-2xl backdrop-blur-md">
            <span className="text-xs text-white font-medium hidden sm:inline">Editing mode active</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={savingForm}
              className="h-8 px-3 text-xs border-border/80 text-muted-foreground hover:text-white cursor-pointer"
            >
              <X className="size-3 mr-1" />
              <span>Cancel</span>
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={savingForm}
              className="h-8 px-4 text-xs font-semibold bg-primary text-background hover:bg-primary-hover cursor-pointer shadow-md"
            >
              {savingForm ? (
                <>
                  <LoaderCircle className="size-3.5 animate-spin mr-1.5" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="size-3 mr-1.5" />
                  <span>Save Changes</span>
                </>
              )}
            </Button>
          </div>
        )}
      </form>

      {/* Change Photo Dialog */}
      <Dialog open={avatarDialogOpen} onOpenChange={setAvatarDialogOpen}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-white text-base font-semibold">
              {profileCopy.dialogs.changePhoto}
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <ImageUpload
              id="profile-avatar-upload"
              bucket="avatars"
              previewShape="circle"
              aspect={1}
              value={profile.avatarPath}
              onChange={handleSaveAvatar}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Change Cover Dialog */}
      <Dialog open={coverDialogOpen} onOpenChange={setCoverDialogOpen}>
        <DialogContent className="max-w-lg bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-white text-base font-semibold">
              {profileCopy.dialogs.changeCover}
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <ImageUpload
              id="profile-cover-upload"
              bucket="covers"
              aspect={7.5}
              value={profile.coverPath}
              onChange={handleSaveCover}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
