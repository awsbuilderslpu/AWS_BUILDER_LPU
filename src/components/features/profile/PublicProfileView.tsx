"use client";

import * as React from "react";
import Link from "next/link";
import {
  MapPin,
  ExternalLink,
  Share2,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  Layers,
  Award,
  Cpu,
  Compass,
  CheckCircle,
  Copy,
  Pencil,
  ArrowLeft,
  QrCode,
  Globe,
  Link as LinkIcon,
} from "lucide-react";
import {
  FaAws,
  FaGithub,
  FaLinkedin,
  FaInstagram,
  FaYoutube,
} from "react-icons/fa6";

import type { PublicProfile } from "@/lib/profile/types";
import { roleMeta, type Role } from "@/data/roles";
import {
  universities,
  programmes,
  departments,
} from "@/data/registration";
import { notify } from "@/lib/admin/notify";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { RoleBadge } from "@/components/features/admin/kit/RoleBadge";
import { Avatar } from "@/components/ui/Avatar";
import { CornerFrame } from "@/components/ui/CornerFrame";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { generateQrDataUrl } from "@/lib/profile/qr";

export interface PublicProfileViewProps {
  profile: PublicProfile;
  media: { avatarUrl: string | null; coverUrl: string | null };
  isOwner?: boolean;
}

type TabType = "overview" | "academics" | "skills" | "links";

export function PublicProfileView({
  profile,
  media,
  isOwner = false,
}: PublicProfileViewProps) {
  const [activeTab, setActiveTab] = React.useState<TabType>("overview");
  const [qrModalOpen, setQrModalOpen] = React.useState(false);
  const [qrDataUrl, setQrDataUrl] = React.useState<string | null>(null);

  const displayRoleTitle =
    profile.publicTitle ||
    (profile.accessRole && roleMeta[profile.accessRole as Role]?.label) ||
    "Member";

  const currentUni =
    universities.find((u) => u.value === profile.university)?.label ||
    profile.university ||
    "Lovely Professional University (LPU)";

  const currentProg =
    programmes.find((p) => p === profile.programme) || profile.programme || "B.Tech";

  const currentDept =
    departments.find((d) => d.value === profile.department)?.label ||
    profile.department ||
    "Computer Science & Engineering";

  const memberId = `AWS-MBR-${profile.userId.slice(0, 8).toUpperCase()}`;

  // Unique profile URL
  const uniqueSlug = profile.username || profile.userId;
  const [fullUrl, setFullUrl] = React.useState<string>(`/profile/${uniqueSlug}`);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/profile/${uniqueSlug}`;
      setFullUrl(url);
      generateQrDataUrl(url, { width: 320, margin: 2 }).then((dataUrl) => {
        if (dataUrl) setQrDataUrl(dataUrl);
      });
    }
  }, [uniqueSlug]);

  const handleShare = async () => {
    try {
      if (typeof window !== "undefined") {
        await navigator.clipboard.writeText(fullUrl);
        notify.success("Unique profile link copied to clipboard!");
      }
    } catch {
      notify.error("Could not copy link");
    }
  };

  const socialLinks = [
    {
      label: "GitHub",
      url: profile.githubUrl,
      icon: FaGithub,
      color: "hover:text-white",
    },
    {
      label: "LinkedIn",
      url: profile.linkedinUrl,
      icon: FaLinkedin,
      color: "hover:text-[#0A66C2]",
    },
    {
      label: "Portfolio",
      url: profile.websiteUrl,
      icon: LinkIcon,
      color: "hover:text-primary",
    },
    {
      label: "AWS Builder",
      url: profile.awsBuilderUrl,
      icon: FaAws,
      color: "hover:text-[#FF9900]",
    },
    {
      label: "Instagram",
      url: profile.instagramUrl,
      icon: FaInstagram,
      color: "hover:text-[#E4405F]",
    },
    {
      label: "YouTube",
      url: profile.youtubeUrl,
      icon: FaYoutube,
      color: "hover:text-[#FF0000]",
    },
  ].filter((s) => Boolean(s.url));

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Navigation Row */}
      <div className="flex items-center justify-between">
        <Link
          href="/members"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          <span>Back to Member Directory</span>
        </Link>

        {isOwner && (
          <Link
            href="/profile"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/40 bg-primary/10 text-xs font-bold text-primary hover:bg-primary/20 transition-colors"
          >
            <Pencil className="size-3.5" />
            <span>Edit My Profile</span>
          </Link>
        )}
      </div>

      {/* Main Header / Banner Card */}
      <div className="rounded-2xl border border-border/80 bg-card/40 backdrop-blur-md overflow-hidden shadow-2xl relative">
        {/* Cover Photo */}
        <div className="relative h-48 sm:h-64 md:h-72 w-full bg-slate-950 overflow-hidden">
          {media.coverUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={media.coverUrl}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            <div className="size-full bg-gradient-to-r from-slate-950 via-slate-900 to-primary/20 flex items-center justify-center relative">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/15 via-transparent to-transparent pointer-events-none" />
              <Cpu className="size-20 text-white/5" />
            </div>
          )}
        </div>

        {/* Profile Info Row */}
        <div className="px-6 sm:px-8 pb-8 pt-0 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-16 sm:-mt-20">
            {/* Avatar & Identifiers */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
              <div className="relative size-28 sm:size-36 rounded-2xl border-4 border-background bg-slate-950 overflow-hidden shadow-2xl shrink-0">
                {media.avatarUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={media.avatarUrl}
                    alt={profile.fullName}
                    className="size-full object-cover"
                  />
                ) : (
                  <Avatar name={profile.fullName} size={144} className="size-full" />
                )}
                <div
                  className="absolute bottom-2 right-2 p-1.5 rounded-full bg-primary text-background shadow-md"
                  title="Verified Community Member"
                >
                  <ShieldCheck className="size-4" />
                </div>
              </div>

              <div className="space-y-2">
                {/* Row 1: Name & Official Roles */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                    {profile.fullName}
                  </h1>
                  {profile.accessRole && (
                    <RoleBadge role={profile.accessRole} />
                  )}
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                    <Sparkles className="size-2.5" />
                    <span>Verified Builder</span>
                  </span>
                </div>

                {/* Row 2: Chapter Badge & Frosted Glass Social Island */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-0.5">
                  <span className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary shadow-xs">
                    LPU Chapter
                  </span>

                  {socialLinks.length > 0 && (
                    <>
                      <span className="hidden sm:inline-block h-3.5 w-px bg-white/20" />
                      <div className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/60 px-2 py-0.5 backdrop-blur-md shadow-md ring-1 ring-white/10">
                        {socialLinks.map((s) => {
                          const Icon = s.icon;
                          return (
                            <a
                              key={s.label}
                              href={s.url!}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={s.label}
                              title={`${s.label}: ${s.url}`}
                              className={cn(
                                "size-6 rounded-full flex items-center justify-center text-slate-300 transition-all duration-150 hover:scale-110 active:scale-95 cursor-pointer",
                                s.color,
                                "hover:bg-white/15"
                              )}
                            >
                              <Icon className="size-3.5" />
                            </a>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {isOwner && socialLinks.length === 0 && (
                    <>
                      <span className="hidden sm:inline-block h-3.5 w-px bg-white/20" />
                      <div className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/60 px-2 py-0.5 backdrop-blur-md shadow-md ring-1 ring-white/10 text-slate-400/50">
                        <Link
                          href="/profile"
                          title="Add GitHub profile link"
                          className="size-6 rounded-full flex items-center justify-center hover:text-white hover:bg-white/10 transition-all duration-150 hover:scale-110 active:scale-95 cursor-pointer"
                        >
                          <FaGithub className="size-3.5" />
                        </Link>
                        <Link
                          href="/profile"
                          title="Add LinkedIn profile link"
                          className="size-6 rounded-full flex items-center justify-center hover:text-white hover:bg-white/10 transition-all duration-150 hover:scale-110 active:scale-95 cursor-pointer"
                        >
                          <FaLinkedin className="size-3.5" />
                        </Link>
                        <Link
                          href="/profile"
                          title="Add website or portfolio link"
                          className="size-6 rounded-full flex items-center justify-center hover:text-white hover:bg-white/10 transition-all duration-150 hover:scale-110 active:scale-95 cursor-pointer"
                        >
                          <LinkIcon className="size-3.5" />
                        </Link>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-muted-foreground">
                  <span className="font-semibold text-primary">{displayRoleTitle}</span>
                  {profile.username && (
                    <>
                      <span>•</span>
                      <span className="font-mono text-foreground/80">@{profile.username}</span>
                    </>
                  )}
                  <span>•</span>
                  <span>AWS Student Builder</span>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-1 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <GraduationCap className="size-3.5 text-primary" />
                    <span>{currentUni}</span>
                  </span>
                  {profile.location && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-3.5 text-primary" />
                      <span>{profile.location}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="h-9 px-3.5 text-xs border-border/80 bg-card/60 hover:bg-card hover:border-primary/50 text-foreground cursor-pointer shadow-sm"
              >
                <Share2 className="size-3.5 mr-1.5 text-primary" />
                <span>Share Profile</span>
              </Button>

              <button
                type="button"
                onClick={() => setQrModalOpen(true)}
                className="inline-flex items-center gap-1.5 h-9 px-3.5 text-xs font-bold rounded-md border border-primary/50 bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer"
              >
                <QrCode className="size-3.5" />
                <span>Digital Pass</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Official Student Builder Credential Pass */}
      <CornerFrame
        className="p-6 sm:p-8 bg-gradient-to-br from-card/90 via-card/50 to-primary/5 border border-primary/30 rounded-2xl relative overflow-hidden shadow-xl"
      >
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
          {/* Left: Credential Pass Mockup */}
          <div className="w-full lg:max-w-md rounded-2xl border-2 border-primary/50 bg-gradient-to-br from-white via-amber-500/[0.04] to-primary/10 dark:from-slate-900 dark:via-slate-950 dark:to-primary/10 p-5 shadow-xl relative overflow-hidden backdrop-blur-md">
            <div className="absolute top-0 right-0 w-36 h-36 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between border-b border-primary/20 dark:border-primary/30 pb-3">
              <div className="flex items-center gap-2">
                <Cpu className="size-5 text-amber-700 dark:text-primary" />
                <div>
                  <span className="text-xs font-black tracking-widest uppercase text-slate-900 dark:text-white block">
                    AWS BUILDER GROUP
                  </span>
                  <span className="text-[10px] text-amber-700 dark:text-primary font-mono block">
                    LPU CHAPTER • MEMBER PASS
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setQrModalOpen(true)}
                className="size-8 rounded-lg overflow-hidden border border-primary/40 bg-white p-0.5 hover:scale-105 transition-transform cursor-pointer shrink-0 shadow-xs"
                title="Click to view full QR code"
              >
                {qrDataUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={qrDataUrl} alt="QR" className="size-full object-contain" />
                ) : (
                  <QrCode className="size-full text-slate-950" />
                )}
              </button>
            </div>

            <div className="flex items-center gap-4 py-4">
              <div className="size-16 rounded-xl border-2 border-primary/60 bg-white dark:bg-slate-950 overflow-hidden shrink-0 shadow-md">
                {media.avatarUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={media.avatarUrl} alt="" className="size-full object-cover" />
                ) : (
                  <Avatar name={profile.fullName} size={64} />
                )}
              </div>
              <div className="min-w-0">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white truncate">{profile.fullName}</h3>
                <p className="text-xs font-semibold text-amber-700 dark:text-primary truncate">{displayRoleTitle}</p>
                <p className="text-[11px] text-muted-foreground truncate">{currentDept}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border/80 dark:border-white/10 text-[11px]">
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-mono">Member ID</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white tracking-wider">{memberId}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-mono">Status</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 capitalize">Verified Builder</span>
              </div>
            </div>
          </div>

          {/* Right: Pass Details */}
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2">
              <Award className="size-5 text-primary" />
              <h3 className="font-bold text-lg text-foreground">Official Student Builder Credential</h3>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              This digital credential certifies {profile.fullName}&apos;s verified affiliation with the AWS Student Builder Group at Lovely Professional University.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs text-primary font-medium">
                <CheckCircle className="size-3" /> Campus Events Access
              </span>
              <span className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs text-primary font-medium">
                <CheckCircle className="size-3" /> Cloud Workshop Verified
              </span>
              <span className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs text-primary font-medium">
                <CheckCircle className="size-3" /> Community Network
              </span>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setQrModalOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline cursor-pointer"
              >
                <QrCode className="size-3.5" />
                <span>View Scannable QR Code & Verification URL</span>
              </button>
            </div>
          </div>
        </div>
      </CornerFrame>

      {/* Tabs Row */}
      <div className="flex items-center gap-2 border-b border-border/80 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer whitespace-nowrap",
            activeTab === "overview"
              ? "bg-primary/15 border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          <Compass className="size-3.5" />
          <span>Overview</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("academics")}
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer whitespace-nowrap",
            activeTab === "academics"
              ? "bg-primary/15 border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          <GraduationCap className="size-3.5" />
          <span>Academics & Journey</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("skills")}
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer whitespace-nowrap",
            activeTab === "skills"
              ? "bg-primary/15 border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          <Layers className="size-3.5" />
          <span>Skills & Tech Stack</span>
          {profile.skills.length > 0 && (
            <span className="ml-1 rounded-full bg-primary/20 px-1.5 py-0.2 text-[10px] text-primary">
              {profile.skills.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("links")}
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer whitespace-nowrap",
            activeTab === "links"
              ? "bg-primary/15 border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          <Globe className="size-3.5" />
          <span>Links & Socials</span>
          {socialLinks.length > 0 && (
            <span className="ml-1 rounded-full bg-primary/20 px-1.5 py-0.2 text-[10px] text-primary">
              {socialLinks.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab Content Panels */}
      <div className="space-y-6">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              {/* Bio & Headline */}
              <div className="rounded-xl border border-border/80 bg-card/60 p-6 space-y-4">
                <h4 className="text-sm font-bold text-foreground uppercase tracking-wider font-mono">
                  About the Builder
                </h4>
                {profile.headline && (
                  <p className="text-base font-semibold text-primary">
                    {profile.headline}
                  </p>
                )}
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {profile.bio || "This member has not written a personal bio yet."}
                </p>
              </div>

              {/* Focus Areas & Interests */}
              {profile.interests.length > 0 && (
                <div className="rounded-xl border border-border/80 bg-card/60 p-6 space-y-3">
                  <h4 className="text-sm font-bold text-foreground uppercase tracking-wider font-mono">
                    Areas of Interest & Cloud Focus
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((interest) => (
                      <span
                        key={interest}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs text-primary font-medium"
                      >
                        <Sparkles className="size-3" />
                        <span>{interest}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Summary Sidebar */}
            <div className="space-y-6">
              <div className="rounded-xl border border-border/80 bg-card/60 p-6 space-y-4">
                <h4 className="text-sm font-bold text-foreground uppercase tracking-wider font-mono">
                  Affiliation Summary
                </h4>
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-muted-foreground block">Chapter</span>
                    <span className="font-semibold text-foreground">AWS Student Builder Group LPU</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">University</span>
                    <span className="font-semibold text-foreground">{currentUni}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Department</span>
                    <span className="font-semibold text-foreground">{currentDept}</span>
                  </div>
                  {profile.location && (
                    <div>
                      <span className="text-muted-foreground block">Location</span>
                      <span className="font-semibold text-foreground">{profile.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Academics Tab */}
        {activeTab === "academics" && (
          <div className="rounded-xl border border-border/80 bg-card/60 p-6 sm:p-8 space-y-6">
            <h4 className="text-sm font-bold text-foreground uppercase tracking-wider font-mono flex items-center gap-2">
              <GraduationCap className="size-4 text-primary" />
              <span>Academic Details</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
              <div className="p-4 rounded-lg bg-background/60 border border-border/60">
                <span className="text-xs text-muted-foreground block font-mono uppercase">University</span>
                <span className="font-bold text-foreground mt-1 block">{currentUni}</span>
              </div>
              <div className="p-4 rounded-lg bg-background/60 border border-border/60">
                <span className="text-xs text-muted-foreground block font-mono uppercase">Programme</span>
                <span className="font-bold text-foreground mt-1 block">{currentProg}</span>
              </div>
              <div className="p-4 rounded-lg bg-background/60 border border-border/60">
                <span className="text-xs text-muted-foreground block font-mono uppercase">Department</span>
                <span className="font-bold text-foreground mt-1 block">{currentDept}</span>
              </div>
              <div className="p-4 rounded-lg bg-background/60 border border-border/60">
                <span className="text-xs text-muted-foreground block font-mono uppercase">Year / Semester</span>
                <span className="font-bold text-foreground mt-1 block">
                  {profile.studyYear || "1st Year"} • {profile.semester || "1st Semester"}
                </span>
              </div>
              {profile.graduationYear && (
                <div className="p-4 rounded-lg bg-background/60 border border-border/60">
                  <span className="text-xs text-muted-foreground block font-mono uppercase">Graduation Year</span>
                  <span className="font-bold text-foreground mt-1 block">{profile.graduationYear}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Skills Tab */}
        {activeTab === "skills" && (
          <div className="rounded-xl border border-border/80 bg-card/60 p-6 sm:p-8 space-y-6">
            <h4 className="text-sm font-bold text-foreground uppercase tracking-wider font-mono flex items-center gap-2">
              <Layers className="size-4 text-primary" />
              <span>Technical Skills & Tools</span>
            </h4>
            {profile.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2.5">
                {profile.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-accent/40 bg-accent/15 px-3 py-1.5 text-xs text-foreground font-semibold hover:border-primary/50 transition-colors"
                  >
                    <Cpu className="size-3 text-primary" />
                    <span>{skill}</span>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No skills listed yet.</p>
            )}
          </div>
        )}

        {/* Links Tab */}
        {activeTab === "links" && (
          <div className="rounded-xl border border-border/80 bg-card/60 p-6 sm:p-8 space-y-6">
            <h4 className="text-sm font-bold text-foreground uppercase tracking-wider font-mono flex items-center gap-2">
              <Globe className="size-4 text-primary" />
              <span>Connect with {profile.fullName}</span>
            </h4>
            {socialLinks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {socialLinks.map((s) => {
                  const Icon = s.icon;
                  return (
                    <a
                      key={s.label}
                      href={s.url!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 rounded-xl border border-border/80 bg-background/60 hover:border-primary/60 hover:bg-card/80 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-card/80 border border-border/60 group-hover:border-primary/40">
                          <Icon className={cn("size-5 transition-colors", s.color)} />
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground block">{s.label}</span>
                          <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate max-w-[180px] block">
                            {s.url}
                          </span>
                        </div>
                      </div>
                      <ExternalLink className="size-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                    </a>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No public social links provided.</p>
            )}
          </div>
        )}
      </div>

      {/* Scannable Pass QR Code Modal */}
      <Dialog open={qrModalOpen} onOpenChange={setQrModalOpen}>
        <DialogContent className="max-w-sm bg-card border-border text-center">
          <DialogHeader>
            <DialogTitle className="text-foreground text-base font-bold flex items-center justify-center gap-2">
              <QrCode className="size-4 text-primary" />
              <span>Builder Pass Verification</span>
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="p-5 rounded-2xl bg-white mx-auto w-fit shadow-2xl">
              {qrDataUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={qrDataUrl} alt="Builder Pass QR Code" className="size-48 object-contain" />
              ) : (
                <QrCode className="size-44 text-slate-950" />
              )}
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">{profile.fullName}</h4>
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
                <span>Copy Unique Link</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setQrModalOpen(false)}
                className="h-8 px-3 text-xs border-border text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <span>Close</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
