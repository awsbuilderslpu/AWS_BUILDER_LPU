import { eventFilters, type EventCategory } from "../../data/events";
import { buildEventsListConfig } from "./config";

const categories: string[] = eventFilters
  .map((f) => f.category)
  .filter((c): c is EventCategory => c !== null);

export const eventsListConfig = buildEventsListConfig(categories);
