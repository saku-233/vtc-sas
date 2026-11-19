import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { zhCN } from "date-fns/locale";

export const DONE_STATUSES = ["已提交", "已评分"];

export function dueLabel(due) {
  return format(parseISO(due), "M月d日 EEEE", { locale: zhCN });
}

export function daysUntil(due, today) {
  return differenceInCalendarDays(parseISO(due), today);
}

export function countdownText(left) {
  if (left < 0) return `已逾期 ${Math.abs(left)} 天`;
  if (left === 0) return "今天截止";
  return `还有 ${left} 天`;
}