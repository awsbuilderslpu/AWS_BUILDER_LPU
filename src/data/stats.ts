import {
  Users,
  Star,
  BarChart3,
  Crown,
  User,
  Calendar,
} from "lucide-react";
import type { StatItem } from "@/components/ui/StatsRow";

export const homeStats: StatItem[] = [
  { value: "200+", label: "Members" },
  { value: "20+", label: "Events" },
  { value: "10+", label: "Workshops" },
  { value: "∞", label: "Opportunities" },
];

export const eventStats: StatItem[] = [
  { value: "20+", label: "Events Organized", icon: Users },
  { value: "2000+", label: "Students Reached", icon: Users },
  { value: "50+", label: "Industry Experts", icon: Star },
  { value: "100+", label: "Projects Built", icon: BarChart3 },
];

export const memberStats: StatItem[] = [
  { value: "200+", label: "Total Members", icon: Users },
  { value: "15+", label: "Core Team", icon: Crown },
  { value: "10+", label: "Mentors & Experts", icon: User },
  { value: "20+", label: "Events Together", icon: Calendar },
];
