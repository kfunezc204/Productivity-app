import {
  addDays,
  addWeeks,
  addMonths,
  nextMonday,
  isWeekend,
} from "date-fns";

export type RecurrenceRule = "daily" | "weekdays" | "weekly" | "monthly";

/**
 * Given a recurrence rule and a reference date, returns the next due date
 * as an ISO 8601 string (date only, e.g. "2026-03-25").
 */
export function getNextDueDate(rule: RecurrenceRule, fromDate: Date): string {
  let next: Date;

  switch (rule) {
    case "daily":
      next = addDays(fromDate, 1);
      break;

    case "weekdays": {
      next = addDays(fromDate, 1);
      // Skip past weekend
      while (isWeekend(next)) {
        next = addDays(next, 1);
      }
      break;
    }

    case "weekly":
      next = addWeeks(fromDate, 1);
      break;

    case "monthly":
      next = addMonths(fromDate, 1);
      break;

    default:
      next = addDays(fromDate, 1);
  }

  return next.toISOString().split("T")[0];
}

// Kept for possible future use
export { nextMonday };
