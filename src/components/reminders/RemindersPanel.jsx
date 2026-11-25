import { Link } from "@tanstack/react-router";
import { ArrowUpRight, BellOff } from "lucide-react";
import ReminderItem from "./ReminderItem";

export default function RemindersPanel({ reminders, courses, compact = false }) {
  const courseByCode = Object.fromEntries((courses ?? []).map((c) => [c.code, c]));
  const list = compact ? reminders.slice(0, 4) : reminders;

  return (
    <section className="rounded-2xl border border-border/80 bg-card p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-base text-foreground">作业提醒</h3>
        {compact ? (
          <Link to="/student/reminders" className="inline-flex items-center gap-1 text-xs text-primary transition-opacity hover:opacity-70">
            全部 <ArrowUpRight className="h-3 w-3" />
          </Link>
        ) : null}
      </div>
      {list.length === 0 ? (
        <div className="mt-4 flex flex-col items-center gap-2 py-8 text-center">
          <BellOff className="h-6 w-6 text-muted-foreground/60" />
          <p className="text-sm text-muted-foreground">暂无提醒，安心学习。</p>
        </div>
      ) : (
        <ul className="mt-3 space-y-2">
          {list.map((r) => (
            <ReminderItem key={r.id} reminder={r} courseName={courseByCode[r.courseCode]?.name} />
          ))}
        </ul>
      )}
    </section>
  );
}