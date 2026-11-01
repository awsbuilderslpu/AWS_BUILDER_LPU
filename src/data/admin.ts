import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  FileText,
  ClipboardList,
  Megaphone,
  ChartNoAxesColumn,
  Settings,
} from "lucide-react";
import type { AppRole } from "@/lib/auth/account";

export interface AdminNavItem {
  key: string;
  label: string;
  href: string;
  icon: LucideIcon;
  roles: AppRole[];
  ready: boolean;
}

export const adminNav: AdminNavItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    roles: ["admin", "core"],
    ready: true,
  },
  {
    key: "members",
    label: "Members",
    href: "/admin/members",
    icon: Users,
    roles: ["admin"],
    ready: true,
  },
  {
    key: "events",
    label: "Events",
    href: "/admin/events",
    icon: CalendarDays,
    roles: ["admin", "core"],
    ready: false,
  },
  {
    key: "blogs",
    label: "Blogs",
    href: "/admin/blogs",
    icon: FileText,
    roles: ["admin", "core"],
    ready: false,
  },
  {
    key: "registrations",
    label: "Registrations",
    href: "/admin/registrations",
    icon: ClipboardList,
    roles: ["admin"],
    ready: true,
  },
  {
    key: "announcements",
    label: "Announcements",
    href: "/admin/announcements",
    icon: Megaphone,
    roles: ["admin"],
    ready: false,
  },
  {
    key: "analytics",
    label: "Analytics",
    href: "/admin/analytics",
    icon: ChartNoAxesColumn,
    roles: ["admin"],
    ready: false,
  },
  {
    key: "settings",
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
    roles: ["admin"],
    ready: false,
  },
];

export function canAccessAdmin(role: AppRole | null): boolean {
  return role === "admin" || role === "core";
}

export function visibleNav(role: AppRole | null): AdminNavItem[] {
  if (!role) return [];
  return adminNav.filter((item) => item.roles.includes(role));
}

export const adminCopy = {
  skipLink: "Skip to content",
  searchPlaceholder: "Jump to a page...",
  soon: "Soon",
  bell: {
    label: "Notifications",
    empty: "No notifications yet.",
  },
  userMenu: {
    viewSite: "View site",
    account: "My account",
    signOut: "Sign out",
  },
  commandMenu: {
    placeholder: "Type a page name...",
    empty: "No pages found.",
    group: "Pages",
  },
  sidebarTagline: ["Learn", "Build", "Share", "Grow", "Together"] as const,
  sidebarLink: "View site",
  dashboard: {
    title: "Dashboard",
    subtitle: "A quick look at how the club is doing.",
    welcome: (name: string, role: string) => `Signed in as ${name} (${role}).`,
    note: "Admin tools appear in the sidebar as they're built.",
    cards: {
      pending: "Pending registrations",
      approved: "Approved members",
      total: "All registrations",
    },
    countsUnavailable: "Counts are unavailable right now.",
    kitLink: "Open the admin kit demo",
  },
  kit: {
    export: "Export",
    exporting: "Exporting...",
    exportDone: (n: number) => `Exported ${n} ${n === 1 ? "row" : "rows"}.`,
    exportFailed: "Couldn't export. Please try again.",
    reset: "Reset",
    from: "From",
    to: "To",
    searchDefault: "Search...",
    pagination: "Pagination",
    showing: (from: number, to: number, total: number, noun: string) =>
      `Showing ${from} to ${to} of ${total} ${noun}`,
    perPage: (n: number) => `${n} / page`,
    rowsPerPage: "Rows per page",
    previous: "Previous page",
    next: "Next page",
    pageN: (n: number) => `Page ${n}`,
    selected: (n: number) => `${n} selected`,
    clearSelection: "Clear selection",
    bulkActions: "Bulk actions",
    selectAll: "Select all rows on this page",
    selectRow: (name: string) => `Select ${name}`,
    sortBy: (column: string) => `Sort by ${column}`,
    emptyTitle: "Nothing to show",
    emptyText: "Try a different search or filter.",
    unavailable: "unavailable",
    close: "Close",
    cancel: "Cancel",
    confirm: "Confirm",
    failed: "Something went wrong. Please try again.",
  },
  forms: {
    image: {
      title: "Click to upload image",
      dragHint: "or drag and drop",
      types: "PNG, JPG or WebP",
      hint: (types: string, maxMb: number, recommended?: string) =>
        `${types} · up to ${maxMb} MB${recommended ? ` · ${recommended} recommended` : ""}`,
      replace: "Replace image",
      remove: "Remove image",
      processing: "Preparing image...",
      uploading: "Uploading...",
      uploaded: "Image uploaded.",
      removed: "Image removed.",
      previewFailed: "Preview unavailable.",
      errors: {
        type: "Please choose a PNG, JPG or WebP image.",
        tooLarge: (mb: number) => `That file is too large. Choose one under ${mb} MB.`,
        pixels: "That image is too large to process. Choose a smaller one.",
        unreadable: "We couldn't read that image. Try another file.",
        compress: (mb: number) =>
          `We couldn't make that image small enough (limit ${mb} MB). Try a smaller one.`,
        upload: "Upload failed. Please try again.",
        signedOut: "Please sign in again to upload images.",
      },
    },
    dateTime: {
      date: "Date",
      time: "Time",
      ist: "Times are in India time (IST).",
      both: "Choose both a date and a time.",
      clear: "Clear date and time",
    },
  },
  registrations: {
    page: {
      title: "Registrations",
      subtitle:
        "Review new registration requests and decide who joins the club.",
    },
    tabs: {
      all: "All Registrations",
      pending: "Pending",
      approved: "Approved",
      rejected: "Rejected",
      archived: "Archived",
    },
    tabsLabel: "Filter by status",
    stats: {
      total: "Total registrations",
      pending: "Pending",
      approved: "Approved",
      rejected: "Rejected",
      today: "Today",
    },
    filters: {
      search: "Search by name, email or registration number...",
      programme: "Programme",
      year: "Year",
      all: "All",
    },
    table: {
      caption: "Registrations",
      noun: "registration",
      nounPlural: "registrations",
      columns: {
        name: "Name",
        registrationNumber: "Reg. No.",
        programme: "Programme",
        year: "Year",
        requestedRole: "Requested Role",
        status: "Status",
        appliedAt: "Applied On",
        actions: "Actions",
      },
    },
    statusLabels: {
      pending: "Pending",
      approved: "Approved",
      rejected: "Rejected",
      archived: "Archived",
    },
    actions: {
      approve: "Approve",
      reject: "Reject",
      archive: "Archive",
      reopen: "Reopen",
      restore: "Restore",
      view: "View details",
    },
    rowLabels: {
      approve: (name: string) => `Approve registration for ${name}`,
      reject: (name: string) => `Reject registration for ${name}`,
      view: (name: string) => `View registration for ${name}`,
      menu: (name: string) => `Actions for ${name}`,
    },
    dialog: {
      approve: {
        title: "Approve registration",
        titleBulk: (count: number) => `Approve ${count} registrations`,
        description:
          "Grant membership and set access role for this applicant.",
        descriptionBulk: (count: number) =>
          `Grant membership and set access role for ${count} applicants.`,
        confirm: "Approve",
        confirmBulk: "Approve all selected",
      },
      reject: {
        title: "Reject registration",
        titleBulk: (count: number) => `Reject ${count} registrations`,
        description: "Are you sure you want to reject this registration?",
        descriptionBulk: (count: number) =>
          `Are you sure you want to reject ${count} registrations?`,
        confirm: "Reject",
        confirmBulk: "Reject all selected",
      },
      archive: {
        title: "Archive registration",
        titleBulk: (count: number) => `Archive ${count} registrations`,
        description: "Move this registration to the archive.",
        descriptionBulk: (count: number) =>
          `Move ${count} registrations to the archive.`,
        confirm: "Archive",
        confirmBulk: "Archive all selected",
      },
      reopen: {
        title: "Reopen registration",
        titleBulk: (count: number) => `Reopen ${count} registrations`,
        description: "Return this rejected registration to pending review.",
        descriptionBulk: (count: number) =>
          `Return ${count} registrations to pending review.`,
        confirm: "Reopen",
        confirmBulk: "Reopen all selected",
      },
      restore: {
        title: "Restore registration",
        titleBulk: (count: number) => `Restore ${count} registrations`,
        description: "Restore this archived registration.",
        descriptionBulk: (count: number) =>
          `Restore ${count} registrations from archive.`,
        confirm: "Restore",
        confirmBulk: "Restore all selected",
      },
      roleLabel: "Role to grant",
      roleHint: (role: string) =>
        `Granting ${role} will update this member's access immediately.`,
      coreHint:
        "You are granting the Core role. Core members have elevated team access.",
      roleDiffer: (requested: string, chosen: string) =>
        `The requested role was ${requested}. You are approving as ${chosen}.`,
      roleDifferBulk: (count: number) =>
        `${count} selected applicant(s) requested a different role.`,
      hasAdminRequest:
        "One or more selected applicants requested the Admin role. The Admin role cannot be granted here and must be assigned manually.",
      emailApplicant: "Email the applicant about this decision",
      emailApplicantBulk: "Email the applicants about this decision",
      emailDisabled: "Email is not configured on this server.",
      noteLabel: "Add a note",
      notePlaceholder: "Optional note...",
      includeNoteInEmail: "Include this note in the email",
    },
    results: {
      singleSuccess: (action: string) =>
        `Registration ${action}d successfully.`,
      bulkSuccess: (count: number, action: string) =>
        `${count} registrations ${action}d successfully.`,
      singleFailed: (action: string) => `Could not ${action} registration.`,
      bulkPartial: (ok: number, failed: number) =>
        `${ok} updated, ${failed} failed.`,
      emailOutcome: {
        sent: "Email sent",
        failed: "Email failed",
        skipped: "Email skipped",
        not_configured: "Email not configured",
      },
      errorMessages: {
        forbidden: "You don't have permission to do that.",
        invalid_transition:
          "This registration was already updated. The list has been refreshed.",
        not_found: "That registration no longer exists.",
        invalid_role: "Choose a role to grant.",
        note_too_long: "The note is too long.",
        invalid_input: "Please check the form and try again.",
        failed: "Something went wrong. Please try again.",
      },
    },
    drawer: {
      title: "Registration Details",
      subtitle: (date: string) => `Submitted on ${date}`,
      sections: {
        contact: "Contact Information",
        personal: "Personal Details",
        academic: "Academic Details",
        interests: "Interests",
        application: "Application",
        review: "Review",
      },
      fields: {
        name: "Full name",
        email: "Email",
        phone: "Phone",
        dob: "Date of birth",
        university: "University",
        programme: "Programme",
        department: "Department",
        year: "Study year",
        semester: "Semester",
        gradYear: "Expected graduation",
        regNo: "Registration number",
        interests: "Interests",
        status: "Status",
        requestedRole: "Requested role",
        appliedAt: "Applied on",
        reviewedBy: "Reviewed by",
        reviewedAt: "Reviewed on",
        adminNote: "Admin note",
      },
      notePlaceholder: "Add an internal note (visible to admins only)...",
      saveNote: "Save note",
      noteSaved: "Note saved.",
    },
    empty: {
      title: "No registrations found",
      description: "Try clearing your filters or search query.",
      clear: "Clear filters",
    },
    error: {
      title: "Could not load registrations",
      description:
        "There was an error querying the database. Please try again.",
      retry: "Retry",
    },
    bulk: {
      selected: (count: number) => `${count} selected`,
      clear: "Clear selection",
    },
    export: {
      label: "Export CSV",
      notice: (count: number) =>
        `Exporting ${count} rows (up to 5,000).`,
      empty: "No rows to export.",
    },
    errors: {
      forbidden: "You don't have permission to do that.",
      invalid_transition:
        "This registration was already updated. The list has been refreshed.",
      not_found: "That registration no longer exists.",
      invalid_role: "Choose a role to grant.",
      note_too_long: "The note is too long.",
      invalid_input: "Please check the form and try again.",
      failed: "Something went wrong. Please try again.",
    },
    email: {
      sent: "Email sent.",
      failed: "The change was saved, but the email couldn't be sent.",
      not_configured:
        "The change was saved. Email isn't set up, so nobody was notified.",
      skipped: "",
    },
  },
  members: {
    page: {
      title: "Members",
      subtitle: "Manage club members, their roles and their access.",
    },
    tabs: {
      all: "All Members",
      admin: "Admins",
      core: "Core Team",
      member: "Members",
      student: "Students",
      participant: "Participants",
    },
    tabsLabel: "Filter by role",
    stats: {
      total: "Total Members",
      admin: "Admins",
      core: "Core Team",
      member: "Members",
      student: "Students",
      participant: "Participants",
    },
    filters: {
      search: "Search by name, email or registration number...",
      department: "Department",
      year: "Year",
      status: "Status",
      allDepartments: "All departments",
      allYears: "All years",
      allStatuses: "All statuses",
      active: "Active",
      inactive: "Inactive",
    },
    table: {
      caption: "Members",
      noun: "members",
      number: "#",
      name: "Name",
      regNo: "Reg. No.",
      email: "Email",
      department: "Department",
      year: "Year",
      role: "Role",
      status: "Status",
      actions: "Actions",
      you: "You",
      selectAll: "Select all members on this page",
      selectRow: (name: string) => `Select ${name}`,
      selectDisabled:
        "This is your own account. Ask another admin to change it.",
    },
    actions: {
      viewDetails: "View details",
      changeRole: "Change role",
      activate: "Set active",
      deactivate: "Set inactive",
      remove: "Remove member",
    },
    rowLabels: {
      menu: (name: string) => `More actions for ${name}`,
      view: (name: string) => `View ${name}`,
    },
    bulk: {
      changeRole: "Change role",
      activate: "Set active",
      deactivate: "Set inactive",
    },
    roleDialog: {
      title: (n: number) =>
        n === 1 ? "Change role" : `Change role for ${n} members`,
      text: "The new role takes effect straight away.",
      label: "New role",
      hint: "Choose the access this person gets.",
      sameAs: "Already has this role.",
      adminTitle: "Give admin access",
      adminText:
        "Admins can manage the whole club, including other members. Only approved, active members can be admins.",
      adminConfirm: "I understand this gives full admin access.",
      adminDisabled: "Only approved, active members can become admins.",
      bulkNote: "Admins can't be changed in bulk. Change them one at a time.",
      skipped: (n: number, reason: string) =>
        `${n} will be skipped: ${reason}.`,
      submit: "Save role",
      working: "Saving...",
      cancel: "Cancel",
    },
    activeDialog: {
      activateTitle: (n: number) =>
        n === 1 ? "Set member active" : `Set ${n} members active`,
      deactivateTitle: (n: number) =>
        n === 1 ? "Set member inactive" : `Set ${n} members inactive`,
      activateText:
        "They regain access to the admin area and member features.",
      deactivateText:
        "They keep their record but lose access until they're set active again.",
      confirmActivate: "Set active",
      confirmDeactivate: "Set inactive",
    },
    removeDialog: {
      title: "Remove member",
      text: "Nothing is deleted. The role becomes Participant and the registration moves to Archived, where it can be restored.",
      confirm: "Remove member",
      demoteFirst: "Demote this admin first, then remove them.",
      self: "This is your own account.",
    },
    drawer: {
      title: "Member details",
      sections: {
        contact: "Contact",
        personal: "Personal information",
        academic: "Academic information",
        skills: "Skills and interests",
        access: "Role management",
        notes: "Notes",
      },
      labels: {
        email: "Email",
        phone: "Phone",
        regNo: "Registration number",
        headline: "Headline",
        location: "Location",
        university: "University",
        programme: "Programme",
        department: "Department",
        year: "Current year",
        semester: "Semester",
        graduation: "Expected graduation",
        memberSince: "Member since",
        status: "Status",
        skills: "Skills",
        interests: "Interests",
        links: "Links",
        none: "Not provided",
      },
      currentRole: "Current role",
      newRole: "Change role to",
      updateRole: "Update role",
      activeLabel: "Active",
      activeHelp: "Inactive members lose access until they're set active again.",
      noteLabel: "Notes (only admins see them)",
      notePlaceholder: "Add notes about this member...",
      noNotes: "This person has no registration, so notes aren't available.",
      saveNote: "Save notes",
      noteSaved: "Notes saved.",
      loading: "Loading details...",
      loadFailed: "We couldn't load the details.",
      retry: "Try again",
    },
    empty: {
      noneTitle: "No members yet",
      noneText:
        "Members appear here once their registration is approved or they hold a role.",
      filteredTitle: "No members match",
      filteredText: "Try a different search or filter.",
      reset: "Reset filters",
    },
    error: {
      title: "Couldn't load members",
      text: "Something went wrong while loading the list.",
      retry: "Try again",
    },
    results: {
      roleChanged: (n: number) =>
        `Changed the role of ${n} ${n === 1 ? "member" : "members"}.`,
      activeChanged: (n: number, active: boolean) =>
        `${n} ${n === 1 ? "member is" : "members are"} now ${active ? "active" : "inactive"}.`,
      removed: "Member removed. Their registration is archived.",
      skipped: (n: number) => `${n} skipped.`,
      failedSome: (n: number) => `${n} could not be updated.`,
      reasons: {
        self: "your own account",
        admin_individually: "admins are changed one at a time",
        no_change: "already set this way",
        admin_needs_approved_active: "not approved and active",
        demote_admin_first: "an admin must be demoted first",
      },
    },
    export: {
      truncated: (n: number) =>
        `Exported the first ${n} rows. Narrow the filters to export the rest.`,
    },
    errors: {
      forbidden: "You don't have permission to do that.",
      cannot_change_self:
        "You can't change your own account here. Ask another admin.",
      not_found: "That person no longer exists.",
      not_a_member:
        "That person isn't a member any more. The list has been refreshed.",
      admin_requires_approved_active:
        "Only approved, active members can become admins.",
      no_change: "Nothing to change.",
      last_admin: "There must always be at least one active admin.",
      demote_admin_first: "Demote this admin first, then remove them.",
      admin_individually: "Admins can only be changed one at a time.",
      confirm_required: "Please confirm the admin change.",
      invalid_input: "Please check the form and try again.",
      failed: "Something went wrong. Please try again.",
    },
  },
};

