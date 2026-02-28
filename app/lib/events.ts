import type { Doc } from "@/convex/_generated/dataModel";

/** A Convex event document. */
export type DmmcEvent = Doc<"event">;

/**
 * Helper to extract a display-friendly date (YYYY-MM-DD) from the datetime
 * string stored in Convex.  Falls back to the raw value if parsing fails.
 */
export function eventDate(e: DmmcEvent): string {
  return e.datetime.slice(0, 10);
}

/**
 * Helper to extract a display-friendly time (HH:MM) from the datetime string.
 */
export function eventTime(e: DmmcEvent): string {
  const t = e.datetime.slice(11, 16);
  return t || "TBD";
}
