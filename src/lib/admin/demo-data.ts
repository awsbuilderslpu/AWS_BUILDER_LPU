// demo only, deleted in the last step
import type { Role } from "@/data/roles";

export interface DemoItem {
  id: string;
  name: string;
  email: string;
  regNo: string;
  programme: string;
  year: string;
  role: Role;
  status: "pending" | "approved" | "rejected" | "archived";
  appliedOn: string;
}

const roles: Role[] = ["student", "participant", "member", "core", "admin"];
const statuses: Array<"pending" | "approved" | "rejected" | "archived"> = [
  "pending",
  "approved",
  "rejected",
  "archived",
];
const programmes = [
  "B.Tech CSE",
  "B.Tech IT",
  "B.Tech ECE",
  "BCA",
  "MCA",
];
const years = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

export const demoItems: DemoItem[] = Array.from({ length: 43 }, (_, i) => {
  const n = i + 1;
  const role = roles[i % roles.length];
  const status = statuses[i % statuses.length];
  const programme = programmes[i % programmes.length];
  const year = years[i % years.length];

  // Distribute applied dates across early 2025
  const day = String((i % 28) + 1).padStart(2, "0");
  const month = String((i % 3) + 1).padStart(2, "0");
  const appliedOn = `2025-${month}-${day}`;

  // Make the third row's name "=1+1 Demo" to test formula injection protection
  const name = n === 3 ? "=1+1 Demo" : `Demo Student ${n}`;

  return {
    id: `demo-${n}`,
    name,
    email: `student-${n}@example.com`,
    regNo: `DEMO-${1000 + n}`,
    programme,
    year,
    role,
    status,
    appliedOn,
  };
});

