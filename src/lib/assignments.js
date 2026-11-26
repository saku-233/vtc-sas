import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { enUS } from "date-fns/locale";

export const DONE_STATUSES = ["Submitted", "Graded"];

export function dueLabel(due) {
  return format(parseISO(due), "MMM d, EEEE", { locale: enUS });
}

export function daysUntil(due, today) {
  return differenceInCalendarDays(parseISO(due), today);
}

export function countdownText(left) {
  if (left < 0) return `${Math.abs(left)} day${Math.abs(left) === 1 ? "" : "s"} overdue`;
  if (left === 0) return "Due today";
  return `${left} day${left === 1 ? "" : "s"} left`;
}