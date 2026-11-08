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
  QrCode,
  CreditCard,
  Cpu,
  Compass,
  CheckCircle,
  ShieldAlert,
  Flame,
  Award,
  Palette,
  Copy,
} from "lucide-react";
import {
  FaAws,
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
import { Avatar } from "@/components/ui/Avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CornerFrame } from "@/components/ui/CornerFrame";
import { generateQrDataUrl } from "@/lib/profile/qr";

export interface ProfileViewProps {
  account: AccountSummary;
  profile: OwnProfile;
  media: {
    avatarUrl: string | null;
    coverUrl: string | null;
  };
  requestedRole: string | null;
}

type TabType = "overview" | "academics" | "skills" | "social" | "security" | "all";

// Built-in theme presets for covers
const COVER_PRESETS = [
  {
    id: "aws-matrix",
    name: "AWS Cyber Grid",
    gradient: "from-[#FF9900]/30 via-slate-950 to-indigo-950",
    bgPattern: "radial-gradient(circle at top right, rgba(255,153,0,0.25), transparent 55%)",
  },
  {
    id: "aurora",
    name: "Aurora Nebula",
    gradient: "from-cyan-900/40 via-slate-950 to-violet-950/60",
    bgPattern: "radial-gradient(circle at top left, rgba(6,182,212,0.25), transparent 50%)",
  },
  {
    id: "deep-ocean",
    name: "Cloud Obsidian",
    gradient: "from-blue-900/40 via-slate-950 to-slate-900",
    bgPattern: "radial-gradient(circle at center, rgba(59,130,246,0.2), transparent 60%)",
  },
  {
    id: "sunset-glow",
    name: "Serverless Sunset",
    gradient: "from-amber-600/30 via-rose-950/40 to-slate-950",
    bgPattern: "radial-gradient(circle at bottom right, rgba(245,158,11,0.25), transparent 55%)",
  },
];

export function ProfileView({
  account,
  profile,
  media,
  requestedRole,
}: ProfileViewProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = React.useState(false);
  const [savingForm, setSavingForm] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<TabType>("overview");
  const [showIdCard, setShowIdCard] = React.useState(false);
  const [qrModalOpen, setQrModalOpen] = React.useState(false);
  const [selectedPreset, setSelectedPreset] = React.useState(COVER_PRESETS[0]);
  const [presetDialogOpen, setPresetDialogOpen] = React.useState(false);
  const [skillCategory, setSkillCategory] = React.useState<string>("all");

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
    shouldUnregister: false,
  });

  const bioRaw = watch("bio");
  const bioValue = typeof bioRaw === "string" ? bioRaw : "";

  // Completeness score and detailed checklist
  const completeness = React.useMemo(() => {
    const checks = [
      { id: "photo", label: "Profile photo", done: Boolean(media.avatarUrl || profile.avatarPath), weight: 15 },
      { id: "cover", label: "Cover banner", done: Boolean(media.coverUrl || profile.coverPath), weight: 10 },
      { id: "bio", label: "About / Bio", done: Boolean(profile.bio && profile.bio.trim().length > 0), weight: 15 },
      { id: "headline", label: "Headline", done: Boolean(profile.headline && profile.headline.trim().length > 0), weight: 10 },
      { id: "skills", label: "Skills (at least 1)", done: Boolean(profile.skills && profile.skills.length > 0), weight: 20 },
      { id: "academics", label: "Academic Info", done: Boolean(profile.university && profile.programme && profile.department), weight: 15 },
      { id: "location", label: "Location", done: Boolean(profile.location && profile.location.trim().length > 0), weight: 5 },
      { id: "social", label: "Social profile link", done: Boolean(profile.awsBuilderUrl || profile.githubUrl || profile.linkedinUrl || profile.websiteUrl), weight: 10 },
    ];
    const score = checks.reduce((sum, item) => sum + (item.done ? item.weight : 0), 0);
    const nextItem = checks.find((item) => !item.done);
    return { score, nextItem, checks };
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

  const uniqueSlug = profile.username || account.id;
  const [fullShareUrl, setFullShareUrl] = React.useState<string>(`/profile/${uniqueSlug}`);
  const [passQrDataUrl, setPassQrDataUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/profile/${uniqueSlug}`;
      setFullShareUrl(url);
      generateQrDataUrl(url, { width: 320, margin: 2 }).then((dataUrl) => {
        if (dataUrl) setPassQrDataUrl(dataUrl);
      });
    }
  }, [uniqueSlug]);

  const handleShare = async () => {
    try {
      if (typeof window !== "undefined") {
        await navigator.clipboard.writeText(fullShareUrl);
        notify.success("Unique profile link copied to clipboard!");
      }
    } catch {
      notify.error("Could not copy link");
    }
  };

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

  const memberId = profile.registrationNumber
    ? `AWS-${profile.registrationNumber}`
    : `AWS-MBR-${account.id.slice(0, 6).toUpperCase()}`;

  const studyYearNumber = parseInt(profile.studyYear || "1", 10) || 1;

  // Filter skills based on user category tab
  const filteredSkills = React.useMemo(() => {
    if (skillCategory === "all") return profile.skills;
    if (skillCategory === "cloud") {
      return profile.skills.filter((s) =>
        /aws|cloud|docker|kubernetes|lambda|s3|serverless|devops|linux|terraform/i.test(s)
      );
    }
    if (skillCategory === "web") {
      return profile.skills.filter((s) =>
        /react|next|vue|html|css|tailwind|javascript|typescript|frontend|ui/i.test(s)
      );
    }
    if (skillCategory === "backend") {
      return profile.skills.filter((s) =>
        /node|python|java|sql|postgres|database|api|backend|express|django|c\+\+/i.test(s)
      );
    }
    return profile.skills;
  }, [profile.skills, skillCategory]);

  /* ========================================================================= */
  /* INDIVIDUAL CARD RENDERERS (Clean, Modular & Balanced)                     */
  /* ========================================================================= */

  // Card 1: Personal Details & Contact
  const renderPersonalCard = () => (
    <div className="rounded-xl border border-border/80 bg-card/60 p-6 backdrop-blur-sm space-y-4 shadow-sm hover:border-primary/40 transition-colors">
      <div className="flex items-center justify-between border-b border-border/70 pb-3">
        <div className="flex items-center gap-2">
          <UserCheck className="size-4 text-primary" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            {profileCopy.sections.personal}
          </h2>
        </div>
      </div>

      <div className="space-y-4">
        {/* Username / Unique Handle */}
        {isEditing ? (
          <div>
            <TextField
              id="profile-username"
              label="Unique Profile Handle (Personal Link)"
              placeholder="e.g. saifkhan"
              error={errors.username?.message}
              {...register("username")}
            />
            <p className="mt-1 text-[11px] text-muted-foreground font-mono">
              Your public link will be: /profile/{String(watch("username") || profile.username || account.id.slice(0, 8))}
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="block text-[11px] uppercase font-mono text-primary font-bold">
                Your Unique Profile Link
              </span>
              <span className="text-white font-mono text-xs sm:text-sm font-semibold">
                /profile/{profile.username || account.id}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="h-7 px-2.5 text-xs border-primary/40 text-primary hover:bg-primary/20 cursor-pointer"
              >
                <Copy className="size-3 mr-1" />
                <span>Copy Link</span>
              </Button>
              <Link
                href={`/profile/${uniqueSlug}`}
                className="inline-flex items-center gap-1 h-7 px-2.5 text-xs font-semibold rounded-md bg-primary text-background hover:bg-primary-hover transition-colors"
              >
                <span>View Public Page</span>
                <ArrowUpRight className="size-3" />
              </Link>
            </div>
          </div>
        )}

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
            <span className="text-[10px] uppercase font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              Primary Account
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
      </div>
    </div>
  );

  // Card 2: Verified Institutional Credentials
  const renderCredentialsCard = () => (
    <div className="rounded-xl border border-border/80 bg-card/60 p-6 backdrop-blur-sm space-y-4 shadow-sm hover:border-primary/40 transition-colors h-full flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-border/70 pb-3">
        <div className="flex items-center gap-2">
          <IdCard className="size-4 text-primary" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Verified Credentials
          </h2>
        </div>
        <span className="inline-flex items-center gap-1 text-[10.5px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20 font-medium">
          <Lock className="size-2.5" />
          <span>Official Record</span>
        </span>
      </div>

      <div className="rounded-lg border border-border/80 bg-background/50 p-4 space-y-3.5">
        <div className="grid grid-cols-2 gap-3.5">
          <div>
            <span className="block text-[11px] text-muted-foreground mb-0.5">
              {profileCopy.labels.registrationNumber}
            </span>
            <span className="font-mono text-xs font-bold text-white">
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

          <div>
            <span className="block text-[11px] text-muted-foreground mb-0.5">
              Student Pass ID
            </span>
            <span className="font-mono text-xs font-semibold text-primary">
              {memberId}
            </span>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground/80 leading-relaxed pt-2 border-t border-border/50">
          {profileCopy.hints.locked}
        </p>
      </div>
    </div>
  );

  // Card 3: About Me
  const renderAboutCard = () => (
    <div className="rounded-xl border border-border/80 bg-card/60 p-6 sm:p-8 backdrop-blur-sm space-y-5 shadow-sm hover:border-primary/40 transition-colors">
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
            <span className="text-xs sm:text-sm font-semibold text-foreground inline-flex items-center gap-1.5">
              <MapPin className="size-3.5 text-primary" />
              <span>{profile.location || profileCopy.labels.none}</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );

  // Card 4: Academic Journey & Degree Progression
  const renderAcademicsCard = () => (
    <div className="rounded-xl border border-border/80 bg-card/60 p-6 backdrop-blur-sm space-y-4 shadow-sm hover:border-primary/40 transition-colors h-full flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-border/70 pb-3">
        <div className="flex items-center gap-2">
          <GraduationCap className="size-4 text-primary" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            {profileCopy.sections.academic}
          </h2>
        </div>
        <span className="inline-flex items-center gap-1 text-[10.5px] text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20 font-medium">
          <BookOpen className="size-2.5" />
          <span>Active Student</span>
        </span>
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
        <div className="rounded-lg border border-border/80 bg-background/50 p-4 space-y-3.5">
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <span className="block text-[11px] text-muted-foreground mb-0.5">
                {profileCopy.labels.university}
              </span>
              <span className="text-xs font-bold text-white truncate block" title={currentUni}>
                {currentUni}
              </span>
            </div>

            <div>
              <span className="block text-[11px] text-muted-foreground mb-0.5">
                {profileCopy.labels.programme}
              </span>
              <span className="text-xs font-semibold text-white truncate block">
                {profile.programme || "-"}
              </span>
            </div>

            <div>
              <span className="block text-[11px] text-muted-foreground mb-0.5">
                {profileCopy.labels.department}
              </span>
              <span className="text-xs font-semibold text-white truncate block" title={currentDept}>
                {currentDept}
              </span>
            </div>

            <div>
              <span className="block text-[11px] text-muted-foreground mb-0.5">
                Study Year & Semester
              </span>
              <span className="font-mono text-xs font-semibold text-primary">
                {profile.studyYear ? `${profile.studyYear} • Sem ${profile.semester || "-"}` : "-"}
              </span>
            </div>
          </div>

          <div className="text-[11px] text-muted-foreground/80 leading-relaxed pt-2 border-t border-border/50 flex items-center justify-between">
            <span>
              Expected Graduation: <strong className="text-white font-mono">{profile.graduationYear || "-"}</strong>
            </span>
            <span className="text-[10.5px] text-emerald-400 font-mono font-medium">
              4-Year Degree
            </span>
          </div>
        </div>
      )}
    </div>
  );

  // Card 5: Skills & Tech Stack
  const renderSkillsCard = () => (
    <div className="rounded-xl border border-border/80 bg-card/60 p-6 sm:p-8 backdrop-blur-sm space-y-4 shadow-sm hover:border-primary/40 transition-colors">
      <div className="flex items-center justify-between border-b border-border/70 pb-3">
        <div className="flex items-center gap-2">
          <Layers className="size-4 text-primary" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            {profileCopy.sections.skills}
          </h2>
        </div>
        {!isEditing && profile.skills.length > 0 && (
          <span className="text-xs text-primary font-mono font-bold">
            {profile.skills.length} mastered
          </span>
        )}
      </div>

      {/* Domain Category Filter */}
      {!isEditing && profile.skills.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: "all", label: "All Skills" },
            { id: "cloud", label: "Cloud & DevOps" },
            { id: "web", label: "Frontend & Web" },
            { id: "backend", label: "Backend & Systems" },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSkillCategory(cat.id)}
              className={cn(
                "px-2.5 py-1 text-[11px] font-semibold rounded-md border transition-all cursor-pointer whitespace-nowrap",
                skillCategory === cat.id
                  ? "bg-primary text-background border-primary shadow-xs"
                  : "border-border/80 bg-card/40 text-muted-foreground hover:text-white"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

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
          {filteredSkills.length > 0 ? (
            <div className="flex flex-wrap gap-2.5">
              {filteredSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-gradient-to-r from-primary/10 to-primary/5 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:border-primary/60 hover:bg-primary/20 transition-all cursor-default"
                >
                  <span className="size-1.5 rounded-full bg-primary" />
                  <span>{skill}</span>
                </span>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center rounded-lg border border-dashed border-border/80 text-muted-foreground text-xs">
              <p>No skills found under this category.</p>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="mt-1.5 text-primary hover:underline font-semibold cursor-pointer"
              >
                Add more skills
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // Card 6: Interests & Passions
  const renderInterestsCard = () => (
    <div className="rounded-xl border border-border/80 bg-card/60 p-6 sm:p-8 backdrop-blur-sm space-y-4 shadow-sm hover:border-primary/40 transition-colors">
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
                  className="inline-flex items-center rounded-full border border-border/80 bg-card/70 px-3.5 py-1 text-xs font-semibold text-slate-200"
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
  );

  // Card 7: Connected Social Profiles
  const renderLinksCard = () => (
    <div className="rounded-xl border border-border/80 bg-card/60 p-6 backdrop-blur-sm space-y-4 shadow-sm hover:border-primary/40 transition-colors">
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
            id="profile-aws-builder"
            label={profileCopy.labels.awsBuilder}
            inputMode="url"
            placeholder="https://builder.aws.com/community/..."
            error={errors.awsBuilderUrl?.message}
            {...register("awsBuilderUrl")}
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
          {profile.awsBuilderUrl || profile.githubUrl || profile.linkedinUrl || profile.websiteUrl || profile.instagramUrl || profile.youtubeUrl ? (
            <div className="grid grid-cols-1 gap-2">
              {profile.awsBuilderUrl && (
                <a
                  href={profile.awsBuilderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-lg border border-border/80 bg-card/40 p-2.5 text-foreground hover:text-white hover:border-[#FF9900]/50 transition-all group"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <FaAws className="size-4 shrink-0 text-[#FF9900]" />
                    <span className="truncate text-xs font-semibold">{profile.awsBuilderUrl}</span>
                  </div>
                  <ExternalLink className="size-3 text-muted-foreground group-hover:text-[#FF9900] shrink-0" />
                </a>
              )}
              {profile.githubUrl && (
                <a
                  href={profile.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-lg border border-border/80 bg-card/40 p-2.5 text-foreground hover:text-white hover:border-primary/50 transition-all group"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <FaGithub className="size-4 shrink-0 text-white" />
                    <span className="truncate text-xs font-semibold">{profile.githubUrl}</span>
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
                    <span className="truncate text-xs font-semibold">{profile.linkedinUrl}</span>
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
                    <span className="truncate text-xs font-semibold">{profile.websiteUrl}</span>
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
                    <span className="truncate text-xs font-semibold">{profile.instagramUrl}</span>
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
                    <span className="truncate text-xs font-semibold">{profile.youtubeUrl}</span>
                  </div>
                  <ExternalLink className="size-3 text-muted-foreground group-hover:text-primary shrink-0" />
                </a>
              )}
            </div>
          ) : (
            <div className="p-4 text-center rounded-lg border border-dashed border-border/80 text-muted-foreground text-xs">
              <p>No social links connected.</p>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="mt-1.5 text-primary hover:underline font-semibold cursor-pointer"
              >
                Connect GitHub or LinkedIn
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // Card 8: Public Directory Visibility & Live Preview
  const renderPublicDirectoryCard = () => (
    <div className="rounded-xl border border-border/80 bg-card/60 p-6 backdrop-blur-sm space-y-4 shadow-sm hover:border-primary/40 transition-colors">
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
          <p className="text-xs text-amber-400 font-medium bg-amber-400/10 p-2.5 rounded-lg border border-amber-400/20">
            {profileCopy.hints.publicNeedsApproval}
          </p>
        )}

        {/* Directory Preview Mini-Card */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Directory Live Preview
            </span>
            <span className="text-[10px] text-primary font-mono">/members preview</span>
          </div>

          <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-background/90 to-card p-4 space-y-3 shadow-md">
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-full overflow-hidden shrink-0 border border-border bg-card">
                {media.avatarUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={media.avatarUrl} alt="" className="size-full object-cover" />
                ) : (
                  <Avatar name={account.displayName} size={44} />
                )}
              </div>
              <div className="min-w-0">
                <span className="text-sm font-bold text-white block truncate">
                  {account.displayName || account.email}
                </span>
                <span className="text-xs text-primary font-semibold block truncate">
                  {displayRoleTitle}
                </span>
              </div>
            </div>
            {profile.headline && (
              <p className="text-xs text-muted-foreground line-clamp-2 italic">
                &ldquo;{profile.headline}&rdquo;
              </p>
            )}
            {profile.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {profile.skills.slice(0, 4).map((s) => (
                  <span key={s} className="text-[10px] rounded-md bg-primary/10 border border-primary/25 px-2 py-0.5 text-slate-200 font-medium">
                    {s}
                  </span>
                ))}
                {profile.skills.length > 4 && (
                  <span className="text-[10px] text-muted-foreground self-center">
                    +{profile.skills.length - 4} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Card 9: Privacy Guarantee
  const renderPrivacyCard = () => (
    <div className="rounded-xl border border-border/80 bg-card/60 p-6 backdrop-blur-sm space-y-4 shadow-sm">
      <div className="flex items-center gap-2 border-b border-border/70 pb-3">
        <ShieldAlert className="size-4 text-emerald-400" />
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">
          Privacy Guarantee
        </h2>
      </div>

      <div className="space-y-3 text-xs leading-relaxed">
        <div className="p-3.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 space-y-1">
          <span className="font-bold text-emerald-400 flex items-center gap-1.5">
            <CheckCircle className="size-3.5" /> What others can see
          </span>
          <p className="text-muted-foreground">
            Full name, public title, bio, professional headline, listed skills, interests, and approved social links.
          </p>
        </div>

        <div className="p-3.5 rounded-lg border border-primary/20 bg-primary/5 space-y-1">
          <span className="font-bold text-primary flex items-center gap-1.5">
            <Lock className="size-3.5" /> What is always kept private
          </span>
          <p className="text-muted-foreground">
            Student registration number, date of birth, phone number, gender, and login email address. These are never shared publicly.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-8 space-y-6">
      {/* Hero Header Card */}
      <div className="relative rounded-2xl border border-border/80 bg-card/85 overflow-hidden backdrop-blur-xl shadow-2xl transition-all">
        {/* Futuristic Cloud Cyber Cover Banner */}
        <div className="relative h-[190px] sm:h-[250px] w-full overflow-hidden bg-slate-950">
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
              className={cn("h-full w-full bg-gradient-to-r relative transition-all duration-500", selectedPreset.gradient)}
              style={{ backgroundImage: selectedPreset.bgPattern }}
            >
              {/* Circuit & Cloud Overlay Grid */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:28px_28px]" />
              <div className="absolute -bottom-8 -right-8 opacity-10 pointer-events-none select-none">
                <Cpu className="size-64 text-primary" />
              </div>
            </div>
          )}

          {/* Cover Controls (Preset Picker & Upload) */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPresetDialogOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-black/60 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md transition-all hover:bg-black/90 hover:border-primary/70 hover:scale-105 cursor-pointer shadow-xl"
            >
              <Palette className="size-3.5 text-primary" aria-hidden="true" />
              <span className="hidden sm:inline">Theme</span>
            </button>

            <button
              type="button"
              onClick={() => setCoverDialogOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-black/60 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-md transition-all hover:bg-black/90 hover:border-primary/70 hover:scale-105 cursor-pointer shadow-xl"
            >
              <ImageIcon className="size-3.5 text-primary" aria-hidden="true" />
              <span>{profileCopy.actions.uploadCover}</span>
            </button>
          </div>
        </div>

        {/* Header Content with Overlapping Avatar */}
        <div className="px-6 sm:px-8 pb-6 pt-0">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 -mt-16 sm:-mt-20 relative z-10">
            {/* Avatar & Main Identity */}
            <div className="flex flex-col sm:flex-row sm:items-end gap-5">
              {/* Avatar circle with multi-ring glow */}
              <div className="relative size-32 sm:size-36 shrink-0 rounded-full border-4 border-card bg-slate-900 shadow-2xl overflow-hidden ring-4 ring-primary/30 group">
                {media.avatarUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element -- private bucket signed URL */
                  <img
                    src={media.avatarUrl}
                    alt={account.displayName || "Avatar"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-slate-900 text-white font-bold">
                    <Avatar name={account.displayName} size={132} />
                  </div>
                )}

                {/* Change Photo Overlay Button */}
                <button
                  type="button"
                  aria-label={profileCopy.actions.uploadAvatar}
                  onClick={() => setAvatarDialogOpen(true)}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-black/65 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white backdrop-blur-xs gap-1"
                >
                  <Camera className="size-6 text-primary drop-shadow" aria-hidden="true" />
                  <span className="text-[10px] font-bold tracking-wider uppercase">Update</span>
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
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400 shadow-xs">
                      <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Verified Builder</span>
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[10.5px] font-medium text-primary">
                    LPU Chapter
                  </span>
                </div>

                <div className="text-sm sm:text-base font-semibold text-primary/95 flex items-center gap-2">
                  <span>{displayRoleTitle}</span>
                  {profile.headline && (
                    <>
                      <span className="text-border">•</span>
                      <span className="text-sm font-normal text-muted-foreground truncate max-w-lg">
                        {profile.headline}
                      </span>
                    </>
                  )}
                </div>

                {/* Quick Meta Chips */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-xs text-muted-foreground">
                  {profile.university && (
                    <span className="inline-flex items-center gap-1.5 font-medium">
                      <GraduationCap className="size-3.5 text-primary shrink-0" />
                      <span className="truncate max-w-[280px]">{currentUni}</span>
                    </span>
                  )}
                  {profile.location && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="size-3.5 text-primary shrink-0" />
                      <span>{profile.location}</span>
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="size-3.5 text-muted-foreground/80 shrink-0" />
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
                onClick={() => setShowIdCard(!showIdCard)}
                className={cn(
                  "h-9 px-3 text-xs border-border/80 transition-all cursor-pointer",
                  showIdCard
                    ? "bg-primary/20 border-primary text-primary shadow-xs"
                    : "bg-card/60 hover:bg-card hover:border-primary/50 text-muted-foreground hover:text-white"
                )}
              >
                <CreditCard className="size-3.5 mr-1.5 text-primary" />
                <span>{showIdCard ? "Hide Pass" : "Builder Pass"}</span>
              </Button>

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

              <Link
                href={`/profile/${uniqueSlug}`}
                className="inline-flex h-9 items-center justify-center rounded-md border border-border/80 bg-card/60 px-3 text-xs font-semibold text-muted-foreground hover:text-white hover:border-primary/50 transition-colors"
                title="View your public builder profile"
              >
                <ArrowUpRight className="size-3.5 mr-1 text-primary" />
                <span>Public Page</span>
              </Link>

              {isPublic && isApproved && (
                <Link
                  href="/members"
                  className="inline-flex h-9 items-center justify-center rounded-md border border-border/80 bg-card/60 px-3 text-xs font-semibold text-muted-foreground hover:text-white hover:border-primary/50 transition-colors"
                >
                  <Compass className="size-3.5 mr-1 text-primary" />
                  <span>Directory</span>
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
                    className="h-9 px-4 text-xs bg-primary text-background hover:bg-primary-hover font-semibold cursor-pointer shadow-lg shadow-primary/25"
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
                  className="h-9 px-4 text-xs font-bold bg-primary text-background hover:bg-primary-hover transition-all cursor-pointer shadow-lg shadow-primary/25 hover:scale-[1.02]"
                >
                  <Pencil className="size-3.5 mr-1.5" />
                  <span>{profileCopy.actions.edit}</span>
                </Button>
              )}
            </div>
          </div>

          {/* Interactive Profile Completeness Strip */}
          <div className="mt-5 pt-4 border-t border-border/60 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3 w-full md:max-w-lg">
              <span className="font-semibold text-white shrink-0 flex items-center gap-1.5">
                <Flame className="size-3.5 text-primary" />
                Profile Power:
              </span>
              <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-slate-800/80 p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary via-amber-400 to-emerald-400 transition-all duration-700 shadow-sm"
                  style={{ width: `${completeness.score}%` }}
                />
              </div>
              <span className="font-mono font-bold text-primary shrink-0">{completeness.score}%</span>
            </div>

            <div className="text-muted-foreground text-xs flex items-center gap-2">
              {completeness.score === 100 ? (
                <span className="text-emerald-400 font-semibold inline-flex items-center gap-1">
                  <CheckCircle2 className="size-3.5" />
                  Elite Builder Profile • 100% Complete!
                </span>
              ) : completeness.nextItem ? (
                <span>
                  Tip: Add <span className="text-primary font-semibold">{completeness.nextItem.label}</span> to boost your community presence.
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Virtual Digital Builder Pass (Toggleable Modal/Banner) */}
      {showIdCard && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-300">
          <CornerFrame className="bg-gradient-to-br from-slate-950 via-[#0B1120] to-slate-900 border-primary/40 shadow-2xl p-6 sm:p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Pass Visual */}
              <div className="w-full max-w-md rounded-2xl border-2 border-primary/50 bg-gradient-to-br from-slate-900 via-slate-950 to-primary/10 p-5 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-36 h-36 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center justify-between border-b border-primary/30 pb-3">
                  <div className="flex items-center gap-2">
                    <Cpu className="size-5 text-primary" />
                    <div>
                      <span className="text-xs font-black tracking-widest uppercase text-white block">
                        AWS BUILDER GROUP
                      </span>
                      <span className="text-[10px] text-primary font-mono block">LPU CHAPTER • MEMBER PASS</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setQrModalOpen(true)}
                    className="size-8 rounded-lg overflow-hidden border border-primary/40 bg-white p-0.5 hover:scale-105 transition-transform cursor-pointer shrink-0"
                    title="Click to expand QR Code"
                  >
                    {passQrDataUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={passQrDataUrl} alt="QR" className="size-full object-contain" />
                    ) : (
                      <QrCode className="size-full text-slate-950" />
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-4 py-4">
                  <div className="size-16 rounded-xl border-2 border-primary/60 bg-slate-950 overflow-hidden shrink-0 shadow-lg">
                    {media.avatarUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={media.avatarUrl} alt="" className="size-full object-cover" />
                    ) : (
                      <Avatar name={account.displayName} size={64} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-base text-white truncate">{account.displayName || account.email}</h3>
                    <p className="text-xs font-semibold text-primary truncate">{displayRoleTitle}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{currentDept}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/10 text-[11px]">
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-mono">ID Number</span>
                    <span className="font-mono font-bold text-white tracking-wider">{memberId}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-mono">Status</span>
                    <span className="font-bold text-emerald-400 capitalize">{account.registrationStatus || "Active"}</span>
                  </div>
                </div>
              </div>

              {/* Pass Description & Benefits */}
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-2">
                  <Award className="size-5 text-primary" />
                  <h3 className="font-bold text-lg text-white">Official Student Builder Credential</h3>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  This digital membership pass confirms your affiliation with the AWS Student Builder Group at Lovely Professional University. It verifies your active participation in workshops, hackathons, cloud labs, and community networking.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs text-primary font-medium">
                    <CheckCircle className="size-3" /> Campus Events Access
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs text-primary font-medium">
                    <CheckCircle className="size-3" /> Cloud Workshop Eligibility
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs text-primary font-medium">
                    <CheckCircle className="size-3" /> Project Mentorship
                  </span>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setQrModalOpen(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline cursor-pointer"
                  >
                    <QrCode className="size-3.5" />
                    <span>View Scannable QR Code & ID Details</span>
                  </button>
                </div>
              </div>
            </div>
          </CornerFrame>
        </div>
      )}

      {/* Incomplete Registration Notice */}
      {!account.profileComplete && (
        <div
          role="alert"
          className="flex items-center justify-between gap-4 rounded-xl border border-primary/50 bg-primary/10 p-4 text-xs sm:text-sm text-foreground backdrop-blur-sm shadow-md"
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

      {/* Quick Metrics KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-xl border border-border/80 bg-card/60 p-4 backdrop-blur-xs flex items-center gap-3.5 hover:border-primary/40 transition-colors shadow-xs">
          <div className="p-2.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
            <ShieldCheck className="size-5" />
          </div>
          <div className="min-w-0">
            <span className="block text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Access Role</span>
            <span className="font-bold text-sm text-white capitalize truncate block">
              {account.role || "Member"}
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-border/80 bg-card/60 p-4 backdrop-blur-xs flex items-center gap-3.5 hover:border-primary/40 transition-colors shadow-xs">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <UserCheck className="size-5" />
          </div>
          <div className="min-w-0">
            <span className="block text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Membership</span>
            <span className="font-bold text-sm text-white capitalize truncate block">
              {account.registrationStatus || "Active"}
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-border/80 bg-card/60 p-4 backdrop-blur-xs flex items-center gap-3.5 hover:border-primary/40 transition-colors shadow-xs">
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Layers className="size-5" />
          </div>
          <div className="min-w-0">
            <span className="block text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Tech Stack</span>
            <span className="font-bold text-sm text-white truncate block">
              {profile.skills.length > 0 ? `${profile.skills.length} Skills Listed` : "None added"}
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-border/80 bg-card/60 p-4 backdrop-blur-xs flex items-center gap-3.5 hover:border-primary/40 transition-colors shadow-xs">
          <div className={cn(
            "p-2.5 rounded-lg border",
            isPublic ? "bg-primary/10 text-primary border-primary/20" : "bg-muted text-muted-foreground border-border"
          )}>
            {isPublic ? <Eye className="size-5" /> : <EyeOff className="size-5" />}
          </div>
          <div className="min-w-0">
            <span className="block text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Public Directory</span>
            <span className="font-bold text-sm text-white truncate block">
              {isPublic ? "Visible" : "Private"}
            </span>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs Bar */}
      <div className="flex items-center overflow-x-auto gap-2 pb-1 scrollbar-none border-b border-border/70">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-lg border transition-all cursor-pointer whitespace-nowrap",
            activeTab === "overview"
              ? "bg-primary/15 border-primary text-primary shadow-xs"
              : "border-transparent text-muted-foreground hover:text-white hover:bg-card/60"
          )}
        >
          <Compass className="size-3.5" />
          <span>Overview</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("academics")}
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-lg border transition-all cursor-pointer whitespace-nowrap",
            activeTab === "academics"
              ? "bg-primary/15 border-primary text-primary shadow-xs"
              : "border-transparent text-muted-foreground hover:text-white hover:bg-card/60"
          )}
        >
          <GraduationCap className="size-3.5" />
          <span>Academics & Journey</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("skills")}
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-lg border transition-all cursor-pointer whitespace-nowrap",
            activeTab === "skills"
              ? "bg-primary/15 border-primary text-primary shadow-xs"
              : "border-transparent text-muted-foreground hover:text-white hover:bg-card/60"
          )}
        >
          <Layers className="size-3.5" />
          <span>Skills & Stack</span>
          {profile.skills.length > 0 && (
            <span className="rounded-full bg-primary/20 px-1.5 py-0.2 text-[10px] text-primary">
              {profile.skills.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("social")}
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-lg border transition-all cursor-pointer whitespace-nowrap",
            activeTab === "social"
              ? "bg-primary/15 border-primary text-primary shadow-xs"
              : "border-transparent text-muted-foreground hover:text-white hover:bg-card/60"
          )}
        >
          <Globe className="size-3.5" />
          <span>Directory & Links</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("security")}
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-lg border transition-all cursor-pointer whitespace-nowrap",
            activeTab === "security"
              ? "bg-primary/15 border-primary text-primary shadow-xs"
              : "border-transparent text-muted-foreground hover:text-white hover:bg-card/60"
          )}
        >
          <Lock className="size-3.5" />
          <span>Credentials & Privacy</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-lg border transition-all cursor-pointer whitespace-nowrap ml-auto",
            activeTab === "all"
              ? "bg-white/10 border-white/30 text-white"
              : "border-transparent text-muted-foreground hover:text-white hover:bg-card/40"
          )}
        >
          <span>View All</span>
        </button>
      </div>

      {/* Main Content Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* =================================================================== */}
        {/* BALANCED 2-COLUMN GRID FOR EACH TAB (Equal 50/50 Columns)          */}
        {/* =================================================================== */}

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div className="space-y-6">
              {renderPersonalCard()}
              {renderCredentialsCard()}
            </div>
            <div className="space-y-6">
              {renderAboutCard()}
              {renderAcademicsCard()}
            </div>
          </div>
        )}

        {/* TAB 2: ACADEMICS & JOURNEY */}
        {activeTab === "academics" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {renderCredentialsCard()}
            {renderAcademicsCard()}
          </div>
        )}

        {/* TAB 3: SKILLS & STACK (Side-by-side equal columns) */}
        {activeTab === "skills" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div className="space-y-6">
              {renderSkillsCard()}
            </div>
            <div className="space-y-6">
              {renderInterestsCard()}
            </div>
          </div>
        )}

        {/* TAB 4: DIRECTORY & LINKS (Side-by-side equal columns) */}
        {activeTab === "social" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div className="space-y-6">
              {renderLinksCard()}
            </div>
            <div className="space-y-6">
              {renderPublicDirectoryCard()}
            </div>
          </div>
        )}

        {/* TAB 5: CREDENTIALS & PRIVACY (Side-by-side equal columns) */}
        {activeTab === "security" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div className="space-y-6">
              {renderCredentialsCard()}
            </div>
            <div className="space-y-6">
              {renderPrivacyCard()}
            </div>
          </div>
        )}

        {/* TAB 6: VIEW ALL */}
        {activeTab === "all" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div className="space-y-6">
              {renderPersonalCard()}
              {renderCredentialsCard()}
              {renderLinksCard()}
              {renderPrivacyCard()}
            </div>
            <div className="space-y-6">
              {renderAboutCard()}
              {renderAcademicsCard()}
              {renderSkillsCard()}
              {renderInterestsCard()}
              {renderPublicDirectoryCard()}
            </div>
          </div>
        )}

        {/* Sticky Floating Action Bar during Edit Mode */}
        {isEditing && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-full border border-primary/50 bg-card/95 px-5 py-2.5 shadow-2xl backdrop-blur-md">
            <span className="text-xs text-white font-semibold hidden sm:inline">Editing mode active</span>
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
              className="h-8 px-4 text-xs font-bold bg-primary text-background hover:bg-primary-hover cursor-pointer shadow-md"
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

      {/* Preset Cover Picker Dialog */}
      <Dialog open={presetDialogOpen} onOpenChange={setPresetDialogOpen}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-white text-base font-bold flex items-center gap-2">
              <Palette className="size-4 text-primary" />
              <span>Select Cloud Cover Preset</span>
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-3">
            {COVER_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  setSelectedPreset(preset);
                  setPresetDialogOpen(false);
                  notify.success(`Applied ${preset.name} theme!`);
                }}
                className={cn(
                  "p-3 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden group",
                  selectedPreset.id === preset.id
                    ? "border-primary ring-2 ring-primary/40"
                    : "border-border hover:border-primary/50"
                )}
              >
                <div className={cn("h-16 w-full rounded-lg bg-gradient-to-r mb-2.5 shadow-xs", preset.gradient)} />
                <span className="text-xs font-bold text-white block truncate">{preset.name}</span>
                <span className="text-[10.5px] text-muted-foreground">Cyber gradient</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Scannable Pass QR Code Modal */}
      <Dialog open={qrModalOpen} onOpenChange={setQrModalOpen}>
        <DialogContent className="max-w-sm bg-card border-border text-center">
          <DialogHeader>
            <DialogTitle className="text-white text-base font-bold flex items-center justify-center gap-2">
              <QrCode className="size-4 text-primary" />
              <span>Builder Pass Verification</span>
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="p-5 rounded-2xl bg-white mx-auto w-fit shadow-2xl">
              {passQrDataUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={passQrDataUrl} alt="Builder Pass QR Code" className="size-48 object-contain" />
              ) : (
                <QrCode className="size-44 text-slate-950" />
              )}
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">{account.displayName || account.email}</h4>
              <p className="text-xs text-primary font-mono">{memberId}</p>
              <p className="text-[11px] text-muted-foreground mt-1">Lovely Professional University Chapter</p>
            </div>
            <div className="pt-2 flex justify-center gap-2">
              <Button
                type="button"
                size="sm"
                onClick={handleShare}
                className="h-8 px-3 text-xs bg-primary text-background font-bold cursor-pointer"
              >
                <Copy className="size-3 mr-1.5" />
                <span>Copy Link</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setQrModalOpen(false)}
                className="h-8 px-3 text-xs border-border text-muted-foreground hover:text-white cursor-pointer"
              >
                <span>Close</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
