import { programmes, yearOptions } from "../../data/registration";
import { buildRegistrationsListConfig } from "./config";

export const registrationsListConfig = buildRegistrationsListConfig(
  programmes as unknown as string[],
  yearOptions as unknown as string[]
);

