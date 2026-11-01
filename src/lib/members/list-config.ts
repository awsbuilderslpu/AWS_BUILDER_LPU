import { departments, yearOptions } from "../../data/registration";
import { buildMembersListConfig } from "./config";

export const membersListConfig = buildMembersListConfig(
  departments.map((d) => d.value),
  yearOptions as unknown as string[]
);

