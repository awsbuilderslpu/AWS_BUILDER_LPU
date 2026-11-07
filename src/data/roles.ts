import type { LucideIcon } from "lucide-react";
import { GraduationCap, User, UserCheck, Crown, ShieldCheck } from "lucide-react";

export type Role = "admin" | "core" | "member" | "student" | "participant";

export interface RoleTone {
  text: string;
  border: string;
  bg: string;
  ring: string;
}

export interface RoleInfo {
  label: string;
  description: string;
  icon: LucideIcon;
  requiresApproval: boolean;
  tone: RoleTone;
}

export const roleMeta: Record<Role, RoleInfo> = {
  student: {
    label: "Student",
    description: "General member",
    icon: GraduationCap,
    requiresApproval: false,
    tone: {
      text: "text-violet",
      border: "border-violet/60",
      bg: "bg-violet/10",
      ring: "ring-violet",
    },
  },
  participant: {
    label: "Participant",
    description: "Join events only",
    icon: User,
    requiresApproval: false,
    tone: {
      text: "text-muted-foreground",
      border: "border-border",
      bg: "bg-card/60",
      ring: "ring-border",
    },
  },
  member: {
    label: "Member",
    description: "Active contributor",
    icon: UserCheck,
    requiresApproval: false,
    tone: {
      text: "text-accent",
      border: "border-accent/60",
      bg: "bg-accent/10",
      ring: "ring-accent",
    },
  },
  core: {
    label: "Core Team",
    description: "Leadership role",
    icon: Crown,
    requiresApproval: true,
    tone: {
      text: "text-primary",
      border: "border-primary/60",
      bg: "bg-primary/10",
      ring: "ring-primary",
    },
  },
  admin: {
    label: "Admin",
    description: "Club administrator",
    icon: ShieldCheck,
    requiresApproval: true,
    tone: {
      text: "text-red-400",
      border: "border-red-400/60",
      bg: "bg-red-400/10",
      ring: "ring-red-400",
    },
  },
};

// Sign-up only REQUESTS a role; core team and admin are assigned by existing admins.
export const signupRoles: Role[] = [
  "student",
  "participant",
  "member",
];
