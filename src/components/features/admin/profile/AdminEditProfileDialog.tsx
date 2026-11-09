"use client";

import * as React from "react";
import {
  User,
  GraduationCap,
  Sparkles,
  Globe,
  LoaderCircle,
  Save,
  Check,
} from "lucide-react";
import { DetailDrawer } from "@/components/features/admin/kit/DetailDrawer";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/TextField";
import { SelectField, type SelectOption } from "@/components/ui/SelectField";
import { DateField } from "@/components/features/admin/forms/DateField";
import { TagInput } from "@/components/features/admin/forms/TagInput";
import { CheckboxField } from "@/components/ui/CheckboxField";
import { fieldClass } from "@/components/ui/formStyles";
import {
  countryCodes,
  universities,
  programmes,
  departments,
  yearOptions,
  semesterOptions,
  interestOptions,
  genderOptions,
  registrationConstants,
} from "@/data/registration";
import {
  getAdminUserProfile,
  adminUpdateUserProfileAction,
} from "@/lib/profile/actions";
import type { AdminProfileFormInput } from "@/lib/profile/validate";
import { notify } from "@/lib/admin/notify";
import { cn } from "@/lib/utils";

export interface AdminEditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
  initialData?: Record<string, unknown> | null;
  onSaved?: () => void;
}

type TabKey = "personal" | "academic" | "bio" | "links";

const tabs: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "personal", label: "Personal", icon: User },
  { key: "academic", label: "Academic", icon: GraduationCap },
  { key: "bio", label: "Bio & Skills", icon: Sparkles },
  { key: "links", label: "Links & Directory", icon: Globe },
];

export function AdminEditProfileDialog({
  open,
  onOpenChange,
  userId,
  initialData,
  onSaved,
}: AdminEditProfileDialogProps) {
  const [activeTab, setActiveTab] = React.useState<TabKey>("personal");
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  // Form State
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [phoneCountryCode, setPhoneCountryCode] = React.useState("+91");
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [registrationNumber, setRegistrationNumber] = React.useState("");
  const [dateOfBirth, setDateOfBirth] = React.useState("");
  const [gender, setGender] = React.useState("");
  const [university, setUniversity] = React.useState("");
  const [programme, setProgramme] = React.useState("");
  const [department, setDepartment] = React.useState("");
  const [studyYear, setStudyYear] = React.useState("");
  const [semester, setSemester] = React.useState("");
  const [graduationYear, setGraduationYear] = React.useState("");
  const [headline, setHeadline] = React.useState("");
  const [bio, setBio] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [skills, setSkills] = React.useState<string[]>([]);
  const [interests, setInterests] = React.useState<string[]>([]);
  const [awsBuilderUrl, setAwsBuilderUrl] = React.useState("");
  const [linkedinUrl, setLinkedinUrl] = React.useState("");
  const [githubUrl, setGithubUrl] = React.useState("");
  const [websiteUrl, setWebsiteUrl] = React.useState("");
  const [instagramUrl, setInstagramUrl] = React.useState("");
  const [youtubeUrl, setYoutubeUrl] = React.useState("");
  const [isPublicProfile, setIsPublicProfile] = React.useState(false);
  const [publicTitle, setPublicTitle] = React.useState("");

  // Load and populate
  React.useEffect(() => {
    if (!open || !userId) {
      return;
    }

    setActiveTab("personal");

    // Pre-populate with initialData if provided
    if (initialData) {
      if (typeof initialData.firstName === "string") setFirstName(initialData.firstName);
      if (typeof initialData.lastName === "string") setLastName(initialData.lastName);
      if (typeof initialData.phoneCountryCode === "string") setPhoneCountryCode(initialData.phoneCountryCode || "+91");
      if (typeof initialData.phoneNumber === "string") setPhoneNumber(initialData.phoneNumber);
      if (typeof initialData.registrationNumber === "string") setRegistrationNumber(initialData.registrationNumber);
      if (typeof initialData.dateOfBirth === "string") setDateOfBirth(initialData.dateOfBirth);
      if (typeof initialData.gender === "string") setGender(initialData.gender);
      if (typeof initialData.university === "string") setUniversity(initialData.university);
      if (typeof initialData.programme === "string") setProgramme(initialData.programme);
      if (typeof initialData.department === "string") setDepartment(initialData.department);
      if (typeof initialData.studyYear === "string") setStudyYear(initialData.studyYear);
      if (typeof initialData.semester === "string") setSemester(initialData.semester);
      if (initialData.graduationYear) setGraduationYear(String(initialData.graduationYear));
      if (typeof initialData.headline === "string") setHeadline(initialData.headline);
      if (typeof initialData.bio === "string") setBio(initialData.bio);
      if (typeof initialData.location === "string") setLocation(initialData.location);
      if (Array.isArray(initialData.skills)) setSkills(initialData.skills as string[]);
      if (Array.isArray(initialData.interests)) setInterests(initialData.interests as string[]);
      if (typeof initialData.awsBuilderUrl === "string") setAwsBuilderUrl(initialData.awsBuilderUrl);
      if (typeof initialData.linkedinUrl === "string") setLinkedinUrl(initialData.linkedinUrl);
      if (typeof initialData.githubUrl === "string") setGithubUrl(initialData.githubUrl);
      if (typeof initialData.websiteUrl === "string") setWebsiteUrl(initialData.websiteUrl);
      if (typeof initialData.instagramUrl === "string") setInstagramUrl(initialData.instagramUrl);
      if (typeof initialData.youtubeUrl === "string") setYoutubeUrl(initialData.youtubeUrl);
      if (typeof initialData.isPublicProfile === "boolean") setIsPublicProfile(initialData.isPublicProfile);
      if (typeof initialData.publicTitle === "string") setPublicTitle(initialData.publicTitle);
    }

    // Always fetch full current profile to get latest complete data
    let active = true;
    setLoading(true);

    getAdminUserProfile(userId)
      .then((data) => {
        if (!active || !data) return;
        setFirstName(String(data.first_name || ""));
        setLastName(String(data.last_name || ""));
        setPhoneCountryCode(String(data.phone_country_code || "+91"));
        setPhoneNumber(String(data.phone_number || ""));
        setRegistrationNumber(String(data.registration_number || ""));
        setDateOfBirth(data.date_of_birth ? String(data.date_of_birth) : "");
        setGender(data.gender ? String(data.gender) : "");
        setUniversity(String(data.university || ""));
        setProgramme(String(data.programme || ""));
        setDepartment(String(data.department || ""));
        setStudyYear(String(data.study_year || ""));
        setSemester(String(data.semester || ""));
        setGraduationYear(data.graduation_year ? String(data.graduation_year) : "");
        setHeadline(String(data.headline || ""));
        setBio(String(data.bio || ""));
        setLocation(String(data.location || ""));
        setSkills(Array.isArray(data.skills) ? (data.skills as string[]) : []);
        setInterests(Array.isArray(data.interests) ? (data.interests as string[]) : []);
        setAwsBuilderUrl(String(data.aws_builder_url || ""));
        setLinkedinUrl(String(data.linkedin_url || ""));
        setGithubUrl(String(data.github_url || ""));
        setWebsiteUrl(String(data.website_url || ""));
        setInstagramUrl(String(data.instagram_url || ""));
        setYoutubeUrl(String(data.youtube_url || ""));
        setIsPublicProfile(Boolean(data.is_public_profile));
        setPublicTitle(String(data.public_title || ""));
      })
      .catch(() => {
        // Silently keep prefilled if fetch fails
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [open, userId, initialData]);

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSave = async () => {
    if (!userId || saving) return;

    if (!firstName.trim()) {
      notify.error("First name is required");
      setActiveTab("personal");
      return;
    }

    if (!lastName.trim()) {
      notify.error("Last name is required");
      setActiveTab("personal");
      return;
    }

    setSaving(true);
    try {
      const payload: AdminProfileFormInput = {
        userId,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneCountryCode: (phoneCountryCode.trim() as (typeof countryCodes)[number]) || "+91",
        phoneNumber: phoneNumber.trim() || null,
        registrationNumber: registrationNumber.trim() || null,
        dateOfBirth: dateOfBirth.trim() || null,
        gender: (gender === "Male" || gender === "Female" ? gender : null) as "Male" | "Female" | null,
        university: university.trim() || null,
        programme: programme.trim() || null,
        department: department.trim() || null,
        studyYear: studyYear.trim() || null,
        semester: semester.trim() || null,
        graduationYear: graduationYear.trim() || null,
        headline: headline.trim() || null,
        bio: bio.trim() || null,
        location: location.trim() || null,
        skills,
        interests,
        awsBuilderUrl: awsBuilderUrl.trim() || null,
        linkedinUrl: linkedinUrl.trim() || null,
        githubUrl: githubUrl.trim() || null,
        websiteUrl: websiteUrl.trim() || null,
        instagramUrl: instagramUrl.trim() || null,
        youtubeUrl: youtubeUrl.trim() || null,
        isPublicProfile,
        publicTitle: publicTitle.trim() || null,
      };

      const res = await adminUpdateUserProfileAction(payload);
      if (!res.ok) {
        notify.error(res.error === "invalid_input" ? "Please check the entered values" : "Failed to update profile");
        return;
      }

      notify.success("Profile updated successfully");
      onSaved?.();
      onOpenChange(false);
    } catch {
      notify.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const uniOptions: SelectOption[] = [
    { value: "", label: "Select university" },
    ...universities.map((u) => ({ value: u.value, label: u.label })),
  ];

  const progOptions: SelectOption[] = [
    { value: "", label: "Select programme" },
    ...programmes.map((p) => ({ value: p, label: p })),
  ];

  const deptOptions: SelectOption[] = [
    { value: "", label: "Select department" },
    ...departments.map((d) => ({ value: d.value, label: `${d.label} (${d.short})` })),
  ];

  const yrOptions: SelectOption[] = [
    { value: "", label: "Select study year" },
    ...yearOptions.map((y) => ({ value: y, label: y })),
  ];

  const semOptions: SelectOption[] = [
    { value: "", label: "Select semester" },
    ...semesterOptions.map((s) => ({ value: s, label: s })),
  ];

  const genOptions: SelectOption[] = [
    { value: "", label: "Select gender" },
    ...genderOptions.map((g) => ({ value: g.value, label: g.label })),
  ];

  const gradYearOptions: SelectOption[] = React.useMemo(() => {
    const currYear = new Date().getFullYear();
    const minYear = registrationConstants.minGraduationYear ?? 2020;
    const maxYear = currYear + registrationConstants.graduationSpan;
    const options: SelectOption[] = [{ value: "", label: "Select graduation year" }];

    const yearsSet = new Set<string>();
    for (let y = minYear; y <= maxYear; y++) {
      yearsSet.add(String(y));
    }
    if (graduationYear && !yearsSet.has(graduationYear)) {
      yearsSet.add(graduationYear);
    }
    const sortedYears = Array.from(yearsSet).sort((a, b) => Number(a) - Number(b));
    for (const y of sortedYears) {
      options.push({ value: y, label: y });
    }
    return options;
  }, [graduationYear]);

  return (
    <DetailDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Profile"
      description="Update personal, academic, bio, and profile details for this user."
      widthClass="sm:max-w-3xl"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
            className="h-10 px-4 font-medium cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving || loading}
            className="h-10 px-5 bg-primary text-background hover:bg-primary-hover font-semibold cursor-pointer flex items-center gap-2"
          >
            {saving ? (
              <>
                <LoaderCircle className="size-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="size-4" />
                <span>Save Changes</span>
              </>
            )}
          </Button>
        </div>
      }
    >
      {loading ? (
        <div className="space-y-4 py-8">
          <div className="h-12 rounded-lg bg-card/60 animate-pulse border border-border" />
          <div className="h-44 rounded-lg bg-card/60 animate-pulse border border-border" />
          <div className="h-32 rounded-lg bg-card/60 animate-pulse border border-border" />
        </div>
      ) : (
        <div className="space-y-5">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-card/60 border border-border overflow-x-auto [scrollbar-width:none]">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    "flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer",
                    isActive
                      ? "bg-primary text-background shadow-md shadow-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="size-3.5 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab 1: Personal */}
          {activeTab === "personal" && (
            <div className="space-y-4 rounded-xl border border-border bg-card/40 p-5">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <User className="size-4 text-primary" />
                <span>Personal & Contact Information</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextField
                  label="First Name"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                />
                <TextField
                  label="Last Name"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                <div className="sm:col-span-1">
                  <SelectField
                    label="Country Code"
                    value={phoneCountryCode}
                    onChange={(e) => setPhoneCountryCode(e.target.value)}
                    options={countryCodes.map((c) => ({ value: c, label: c }))}
                  />
                </div>
                <div className="sm:col-span-2">
                  <TextField
                    label="Phone Number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="9876543210"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <TextField
                  label="Registration Number"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  placeholder="e.g. 12345678"
                />

                <DateField
                  id="admin-edit-dob"
                  label="Date of Birth"
                  value={dateOfBirth}
                  onChange={setDateOfBirth}
                />

                <SelectField
                  label="Gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  options={genOptions}
                />
              </div>
            </div>
          )}

          {/* Tab 2: Academic */}
          {activeTab === "academic" && (
            <div className="space-y-4 rounded-xl border border-border bg-card/40 p-5">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <GraduationCap className="size-4 text-primary" />
                <span>Academic Information</span>
              </h4>

              <SelectField
                label="University"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                options={uniOptions}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SelectField
                  label="Programme"
                  value={programme}
                  onChange={(e) => setProgramme(e.target.value)}
                  options={progOptions}
                />

                <SelectField
                  label="Department / Branch"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  options={deptOptions}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <SelectField
                  label="Current Year"
                  value={studyYear}
                  onChange={(e) => setStudyYear(e.target.value)}
                  options={yrOptions}
                />

                <SelectField
                  label="Current Semester"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  options={semOptions}
                />

                <SelectField
                  label="Graduation Year"
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(e.target.value)}
                  options={gradYearOptions}
                />
              </div>
            </div>
          )}

          {/* Tab 3: Bio & Skills */}
          {activeTab === "bio" && (
            <div className="space-y-4 rounded-xl border border-border bg-card/40 p-5">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                <span>Headline, Bio & Skills</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextField
                  label="Headline"
                  maxLength={120}
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. Cloud Engineer | Full-Stack Builder"
                />

                <TextField
                  label="Location"
                  maxLength={120}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Jalandhar, Punjab"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[12.5px] font-medium text-foreground">
                  <label htmlFor="admin-edit-bio">Bio</label>
                  <span className="text-[11.5px] text-muted-foreground font-normal">
                    {bio.length} / 1000
                  </span>
                </div>
                <textarea
                  id="admin-edit-bio"
                  rows={4}
                  maxLength={1000}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Brief about the user..."
                  className={cn(fieldClass, "h-auto py-2.5 resize-none leading-relaxed")}
                />
              </div>

              <TagInput
                id="admin-edit-skills"
                label="Skills"
                value={skills}
                onChange={setSkills}
                maxTags={20}
                hint="Press Enter or comma to add a skill (max 20)"
              />

              <div className="space-y-2 pt-2">
                <label className="block text-[12.5px] font-medium text-foreground">
                  Interests
                </label>
                <div className="flex flex-wrap gap-2">
                  {interestOptions.map((interest) => {
                    const selected = interests.includes(interest);
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border",
                          selected
                            ? "bg-primary/20 text-primary border-primary/50 shadow-sm"
                            : "bg-card/60 text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                        )}
                      >
                        {selected && <Check className="size-3" />}
                        <span>{interest}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Links & Visibility */}
          {activeTab === "links" && (
            <div className="space-y-4 rounded-xl border border-border bg-card/40 p-5">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Globe className="size-4 text-primary" />
                <span>Social Links & Directory Settings</span>
              </h4>

              <div className="space-y-4">
                <TextField
                  label="AWS Builder Profile"
                  value={awsBuilderUrl}
                  onChange={(e) => setAwsBuilderUrl(e.target.value)}
                  placeholder="https://builder.aws.com/community/username"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <TextField
                    label="LinkedIn URL"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                  />

                  <TextField
                    label="GitHub URL"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/username"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <TextField
                  label="Website URL"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://yourdomain.com"
                />

                <TextField
                  label="Instagram URL"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="https://instagram.com/username"
                />

                <TextField
                  label="YouTube URL"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://youtube.com/@channel"
                />
              </div>

              <div className="pt-3 border-t border-border space-y-4">
                <CheckboxField
                  id="admin-edit-public"
                  label={
                    <div>
                      <span className="font-medium text-foreground">Public Profile</span>
                      <p className="text-[12px] text-muted-foreground font-normal mt-0.5">
                        Show this user&apos;s profile in the public member directory
                      </p>
                    </div>
                  }
                  checked={isPublicProfile}
                  onChange={(e) => setIsPublicProfile(e.target.checked)}
                />

                <TextField
                  label="Public Title"
                  value={publicTitle}
                  maxLength={80}
                  onChange={(e) => setPublicTitle(e.target.value)}
                  placeholder="e.g. Core Lead, Cloud Architect"
                  hint="Optional badge/title shown on their public member card"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </DetailDrawer>
  );
}

