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
import { ProfileSidebar } from "./ProfileSidebar";

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
    <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-8">
      {/* Layout Grid */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
        {/* Left Column: Sidebar Navigation */}
        <ProfileSidebar />

        {/* Right Column: Main Content */}
        <div className="flex-1 w-full min-w-0 space-y-6">
          {/* Header Card */}
          <div className="rounded-xl border border-border bg-card/60 overflow-hidden backdrop-blur-sm shadow-sm">
            {/* Cover Area */}
            <div className="relative h-[160px] sm:h-[200px] w-full overflow-hidden">
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
                  className="h-full w-full bg-gradient-to-r from-primary/20 via-card to-accent/20"
                />
              )}

              {/* Cover Change Button */}
              <button
                type="button"
                onClick={() => setCoverDialogOpen(true)}
                className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-background/80 px-2.5 py-1.5 text-xs font-medium text-white backdrop-blur-md transition-colors hover:bg-background hover:border-primary/50 cursor-pointer shadow-sm"
              >
                <ImageIcon className="size-3.5" aria-hidden="true" />
                <span>{profileCopy.actions.uploadCover}</span>
              </button>
            </div>

            {/* Header Content with Overlapping Avatar */}
            <div className="px-6 pb-6 pt-0">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                  {/* Avatar 112px circle */}
                  <div className="relative size-28 shrink-0 rounded-full border-4 border-background bg-card shadow-md overflow-hidden">
                    {media.avatarUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element -- private bucket signed URL */
                      <img
                        src={media.avatarUrl}
                        alt={account.displayName || "Avatar"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Avatar name={account.displayName} size={104} />
                      </div>
                    )}

                    {/* Change Photo Overlay Button */}
                    <button
                      type="button"
                      aria-label={profileCopy.actions.uploadAvatar}
                      onClick={() => setAvatarDialogOpen(true)}
                      className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity cursor-pointer text-white"
                    >
                      <Camera className="size-6 drop-shadow" aria-hidden="true" />
                    </button>
                  </div>

                  {/* Name and Public Title / Access Role */}
                  <div className="sm:mb-1">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
                      {account.displayName || account.email}
                    </h1>
                    <div className="mt-0.5 text-sm sm:text-base font-semibold text-primary">
                      {displayRoleTitle}
                    </div>
                  </div>
                </div>

                {/* Edit Controls */}
                <div className="sm:mb-1 shrink-0 flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleCancel}
                        disabled={savingForm}
                        className="h-9 px-3.5 text-xs font-semibold cursor-pointer"
                      >
                        <X className="size-3.5 mr-1.5" />
                        <span>{profileCopy.actions.cancel}</span>
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleSubmit(onSubmit)}
                        disabled={savingForm}
                        className="h-9 px-4 text-xs bg-primary text-background hover:bg-primary-hover font-semibold cursor-pointer"
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
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="h-9 px-3.5 text-xs font-semibold border-border bg-card/40 hover:border-primary/50 cursor-pointer"
                    >
                      <Pencil className="size-3.5 mr-1.5 text-primary" />
                      <span>{profileCopy.actions.edit}</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Headline, Location, and Links Strip */}
              <div className="mt-4 pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm text-muted-foreground">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  {profile.headline && (
                    <span className="text-foreground/90 font-medium">
                      {profile.headline}
                    </span>
                  )}
                  {profile.location && (
                    <span className="inline-flex items-center gap-1 text-muted-foreground text-xs sm:text-sm">
                      <MapPin className="size-3.5 text-primary shrink-0" aria-hidden="true" />
                      <span>{profile.location}</span>
                    </span>
                  )}
                </div>

                {/* Social Links that are set */}
                <div className="flex items-center gap-3">
                  {profile.githubUrl && (
                    <a
                      href={profile.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="GitHub profile"
                      className="text-muted-foreground hover:text-white transition-colors"
                    >
                      <FaGithub className="size-4" />
                    </a>
                  )}
                  {profile.linkedinUrl && (
                    <a
                      href={profile.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="LinkedIn profile"
                      className="text-muted-foreground hover:text-white transition-colors"
                    >
                      <FaLinkedin className="size-4" />
                    </a>
                  )}
                  {profile.websiteUrl && (
                    <a
                      href={profile.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Personal website"
                      className="text-muted-foreground hover:text-white transition-colors"
                    >
                      <Globe className="size-4" />
                    </a>
                  )}
                  {profile.instagramUrl && (
                    <a
                      href={profile.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Instagram profile"
                      className="text-muted-foreground hover:text-white transition-colors"
                    >
                      <FaInstagram className="size-4" />
                    </a>
                  )}
                  {profile.youtubeUrl && (
                    <a
                      href={profile.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="YouTube channel"
                      className="text-muted-foreground hover:text-white transition-colors"
                    >
                      <FaYoutube className="size-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Incomplete Registration Notice */}
          {!account.profileComplete && (
            <div
              role="alert"
              className="flex items-center justify-between gap-4 rounded-xl border border-primary/40 bg-primary/10 p-4 text-xs sm:text-sm text-foreground backdrop-blur-sm"
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

          {/* Form Wrap / Cards Grid */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* Card a: Personal Information */}
              <div className="rounded-lg border border-border bg-card/60 p-6 sm:p-8 space-y-4">
                <h2 className="text-base font-semibold text-white border-b border-border pb-3">
                  {profileCopy.sections.personal}
                </h2>

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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                      <div>
                        <span className="block text-muted-foreground font-medium mb-1">
                          {profileCopy.labels.firstName}
                        </span>
                        <span className="text-foreground font-medium">
                          {profile.firstName || "-"}
                        </span>
                      </div>
                      <div>
                        <span className="block text-muted-foreground font-medium mb-1">
                          {profileCopy.labels.lastName}
                        </span>
                        <span className="text-foreground font-medium">
                          {profile.lastName || "-"}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Email: Always Read-Only */}
                  <div>
                    <label
                      htmlFor="profile-email-readonly"
                      className="block text-[12.5px] font-medium text-white mb-1"
                    >
                      {profileCopy.labels.email}
                    </label>
                    <input
                      id="profile-email-readonly"
                      type="email"
                      value={account.email}
                      readOnly
                      disabled
                      className="w-full h-10 rounded-md border border-border bg-card/20 px-3 text-[13px] text-muted-foreground cursor-not-allowed select-none"
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
                      <span className="block text-muted-foreground font-medium mb-1">
                        {profileCopy.labels.phone}
                      </span>
                      <span className="text-foreground font-medium">
                        {profile.phoneNumber
                          ? `${profile.phoneCountryCode || "+91"} ${profile.phoneNumber}`
                          : "-"}
                      </span>
                    </div>
                  )}

                  {/* Registration Number & Date of Birth (Locked) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/60">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[12.5px] font-medium text-muted-foreground">
                          {profileCopy.labels.registrationNumber}
                        </span>
                        <Lock className="size-3 text-muted-foreground/80" aria-hidden="true" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-foreground">
                        {profile.registrationNumber || "-"}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[12.5px] font-medium text-muted-foreground">
                          {profileCopy.labels.dateOfBirth}
                        </span>
                        <Lock className="size-3 text-muted-foreground/80" aria-hidden="true" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-foreground">
                        {formatDob(profile.dateOfBirth)}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[12.5px] font-medium text-muted-foreground">
                          {profileCopy.labels.gender}
                        </span>
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-foreground">
                        {profile.gender || "-"}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11.5px] text-muted-foreground">
                    {profileCopy.hints.locked}
                  </p>
                </div>
              </div>

              {/* Card b: Academic Information */}
              <div className="rounded-lg border border-border bg-card/60 p-6 sm:p-8 space-y-4">
                <h2 className="text-base font-semibold text-white border-b border-border pb-3">
                  {profileCopy.sections.academic}
                </h2>

                <div className="space-y-4">
                  {isEditing ? (
                    <>
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
                    </>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                      <div className="sm:col-span-2">
                        <span className="block text-muted-foreground font-medium mb-1">
                          {profileCopy.labels.university}
                        </span>
                        <span className="text-foreground font-medium">
                          {currentUni}
                        </span>
                      </div>
                      <div>
                        <span className="block text-muted-foreground font-medium mb-1">
                          {profileCopy.labels.programme}
                        </span>
                        <span className="text-foreground font-medium">
                          {profile.programme || "-"}
                        </span>
                      </div>
                      <div>
                        <span className="block text-muted-foreground font-medium mb-1">
                          {profileCopy.labels.department}
                        </span>
                        <span className="text-foreground font-medium">
                          {currentDept}
                        </span>
                      </div>
                      <div>
                        <span className="block text-muted-foreground font-medium mb-1">
                          {profileCopy.labels.studyYear}
                        </span>
                        <span className="text-foreground font-medium">
                          {profile.studyYear || "-"}
                        </span>
                      </div>
                      <div>
                        <span className="block text-muted-foreground font-medium mb-1">
                          {profileCopy.labels.semester}
                        </span>
                        <span className="text-foreground font-medium">
                          {profile.semester || "-"}
                        </span>
                      </div>
                      <div>
                        <span className="block text-muted-foreground font-medium mb-1">
                          {profileCopy.labels.graduationYear}
                        </span>
                        <span className="text-foreground font-medium">
                          {profile.graduationYear || "-"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Card c: About */}
              <div className="rounded-lg border border-border bg-card/60 p-6 sm:p-8 space-y-4">
                <h2 className="text-base font-semibold text-white border-b border-border pb-3">
                  {profileCopy.sections.about}
                </h2>

                <div className="space-y-4">
                  {isEditing ? (
                    <>
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
                          rows={4}
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
                    </>
                  ) : (
                    <div className="space-y-3 text-xs sm:text-sm">
                      <div>
                        <span className="block text-muted-foreground font-medium mb-1">
                          {profileCopy.labels.headline}
                        </span>
                        <span className="text-foreground font-medium">
                          {profile.headline || profileCopy.labels.none}
                        </span>
                      </div>
                      <div>
                        <span className="block text-muted-foreground font-medium mb-1">
                          {profileCopy.labels.bio}
                        </span>
                        <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                          {profile.bio || profileCopy.labels.none}
                        </p>
                      </div>
                      <div>
                        <span className="block text-muted-foreground font-medium mb-1">
                          {profileCopy.labels.location}
                        </span>
                        <span className="text-foreground font-medium">
                          {profile.location || profileCopy.labels.none}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Card d: Skills */}
              <div className="rounded-lg border border-border bg-card/60 p-6 sm:p-8 space-y-4">
                <h2 className="text-base font-semibold text-white border-b border-border pb-3">
                  {profileCopy.sections.skills}
                </h2>

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
                  <div className="space-y-2">
                    {profile.skills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.map((skill) => (
                          <span
                            key={skill}
                            className="inline-flex items-center rounded-md border border-accent/40 bg-accent/10 px-2.5 py-1 text-xs font-medium text-foreground"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {profileCopy.labels.none}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Card e: Interests */}
              <div className="rounded-lg border border-border bg-card/60 p-6 sm:p-8 space-y-4">
                <h2 className="text-base font-semibold text-white border-b border-border pb-3">
                  {profileCopy.sections.interests}
                </h2>

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
                                    "inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer select-none",
                                    isChecked
                                      ? "border-primary bg-primary/10 text-primary"
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
                  <div className="space-y-2">
                    {profile.interests.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {profile.interests.map((interest) => (
                          <span
                            key={interest}
                            className="inline-flex items-center rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-foreground"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {profileCopy.labels.none}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Card f: Links */}
              <div className="rounded-lg border border-border bg-card/60 p-6 sm:p-8 space-y-4">
                <h2 className="text-base font-semibold text-white border-b border-border pb-3">
                  {profileCopy.labels.links}
                </h2>

                {isEditing ? (
                  <div className="space-y-3">
                    <TextField
                      id="profile-linkedin"
                      label={profileCopy.labels.linkedin}
                      inputMode="url"
                      placeholder="https://linkedin.com/in/..."
                      error={errors.linkedinUrl?.message}
                      {...register("linkedinUrl")}
                    />
                    <TextField
                      id="profile-github"
                      label={profileCopy.labels.github}
                      inputMode="url"
                      placeholder="https://github.com/..."
                      error={errors.githubUrl?.message}
                      {...register("githubUrl")}
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
                  <div className="space-y-2.5 text-xs sm:text-sm">
                    {profile.linkedinUrl ||
                    profile.githubUrl ||
                    profile.websiteUrl ||
                    profile.instagramUrl ||
                    profile.youtubeUrl ? (
                      <div className="space-y-2">
                        {profile.linkedinUrl && (
                          <a
                            href={profile.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-foreground hover:text-primary transition-colors truncate"
                          >
                            <FaLinkedin className="size-4 shrink-0 text-primary" />
                            <span className="truncate">{profile.linkedinUrl}</span>
                            <ExternalLink className="size-3 text-muted-foreground shrink-0" />
                          </a>
                        )}
                        {profile.githubUrl && (
                          <a
                            href={profile.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-foreground hover:text-primary transition-colors truncate"
                          >
                            <FaGithub className="size-4 shrink-0 text-primary" />
                            <span className="truncate">{profile.githubUrl}</span>
                            <ExternalLink className="size-3 text-muted-foreground shrink-0" />
                          </a>
                        )}
                        {profile.websiteUrl && (
                          <a
                            href={profile.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-foreground hover:text-primary transition-colors truncate"
                          >
                            <Globe className="size-4 shrink-0 text-primary" />
                            <span className="truncate">{profile.websiteUrl}</span>
                            <ExternalLink className="size-3 text-muted-foreground shrink-0" />
                          </a>
                        )}
                        {profile.instagramUrl && (
                          <a
                            href={profile.instagramUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-foreground hover:text-primary transition-colors truncate"
                          >
                            <FaInstagram className="size-4 shrink-0 text-primary" />
                            <span className="truncate">{profile.instagramUrl}</span>
                            <ExternalLink className="size-3 text-muted-foreground shrink-0" />
                          </a>
                        )}
                        {profile.youtubeUrl && (
                          <a
                            href={profile.youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-foreground hover:text-primary transition-colors truncate"
                          >
                            <FaYoutube className="size-4 shrink-0 text-primary" />
                            <span className="truncate">{profile.youtubeUrl}</span>
                            <ExternalLink className="size-3 text-muted-foreground shrink-0" />
                          </a>
                        )}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">
                        {profileCopy.labels.none}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Card g: Public profile */}
              <div className="rounded-lg border border-border bg-card/60 p-6 sm:p-8 space-y-4">
                <h2 className="text-base font-semibold text-white border-b border-border pb-3">
                  {profileCopy.sections.public}
                </h2>

                <div className="space-y-4">
                  {/* Public Switch */}
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <span className="block text-sm font-medium text-white">
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
                          ? "bg-primary cursor-pointer"
                          : "bg-card border-border cursor-pointer"
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
                    <p className="text-xs text-primary/90 font-medium">
                      {profileCopy.hints.publicNeedsApproval}
                    </p>
                  )}

                  {/* Public Title (Read-Only) */}
                  <div className="pt-3 border-t border-border">
                    <span className="block text-xs font-medium text-muted-foreground mb-1">
                      {profileCopy.sections.publicTitle}
                    </span>
                    <span className="text-xs sm:text-sm font-medium text-foreground">
                      {profile.publicTitle || profileCopy.labels.none}
                    </span>
                    <p className="mt-1 text-[11.5px] text-muted-foreground">
                      {profileCopy.hints.publicTitle}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card h: Your access */}
              <div className="rounded-lg border border-border bg-card/60 p-6 sm:p-8 space-y-4">
                <h2 className="text-base font-semibold text-white border-b border-border pb-3">
                  {profileCopy.sections.role}
                </h2>

                <div className="space-y-4">
                  {/* Current Role */}
                  <div>
                    <span className="block text-xs font-medium text-muted-foreground mb-1.5">
                      {profileCopy.access.current}
                    </span>
                    <RoleBadge role={account.role || "participant"} />
                  </div>

                  {/* Registration Status */}
                  <div className="pt-2 border-t border-border/60">
                    <span className="block text-xs font-medium text-muted-foreground mb-1.5">
                      Registration status
                    </span>
                    <div className="flex items-center gap-2">
                      <StatusBadge
                        tone={
                          (account.registrationStatus &&
                            statusTones[account.registrationStatus]) ||
                          "muted"
                        }
                      >
                        {account.registrationStatus === "approved"
                          ? profileCopy.access.approved
                          : account.registrationStatus === "pending"
                          ? profileCopy.access.pending
                          : account.registrationStatus || "None"}
                      </StatusBadge>
                    </div>
                  </div>

                  {/* Requested Role when registration is pending */}
                  {account.registrationStatus === "pending" && requestedRole && (
                    <div className="pt-2 border-t border-border/60">
                      <span className="block text-xs font-medium text-muted-foreground mb-1.5">
                        {profileCopy.access.requested}
                      </span>
                      <RoleBadge role={requestedRole as Role} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

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
