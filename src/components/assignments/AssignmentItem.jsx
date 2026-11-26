import { Check, CalendarDays, Percent, RotateCcw } from "lucide-react";
import { countdownText, daysUntil, dueLabel, DONE_STATUSES } from "@/lib/assignments";
import { cn } from "@/lib/utils";

const STATUS_STYLE = {
  "Not Started": "bg-secondary text-secondary-foreground",
  "In Progress": "bg-[hsl(38_78%_92%)] text-[hsl(28_68%_30%)]",
  "Submitted": "bg-[hsl(168_40%_92%)] text-[hsl(168_45%_24%)]",
  "Graded": "bg-[hsl(212_42%_93%)] text-[hsl(215_42%_30%)]",
};

export default function AssignmentItem({ item, course, today, onToggle }) {
  const left = today ? daysUntil(item.due, today) : null;
  const done = DONE_STATUSES.includes(item.status);
  const overdue = left !== null && left < 0 && !done;

  return (
    <li className="group flex flex-col gap-4 rounded-2xl border border-border/80 bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_44px_-30px_rgba(20,40,35,0.5)] sm:flex-row sm:items-center sm:gap-6">
      <div className="flex min-w-0 flex-1 items-start gap-4">
        <span
          className="mt-1 h-10 w-1 shrink-0 rounded-full opacity-80"
          style={{ backgroundColor: course?.color ?? "#94A3B8" }}
        />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-[11px] tracking-[0.12em] text-muted-foreground">
            <span className="font-medium uppercase">{course?.code}</span>
            <span className="text-muted-foreground/60">·</span>
            <span className="tracking-normal">{course?.name}</span>
          </div>
          <h3
            className={cn(
              "mt-1 truncate font-heading text-[17px] leading-snug text-foreground",
              done && "text-muted-foreground line-through decoration-border"
            )}
          >
            {item.title}
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
            <span>{item.type}</span>
            <span className="flex items-center gap-1">
              <Percent className="h-3.5 w-3.5" />
              {item.weight}% of final grade
            </span>
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {dueLabel(item.due)}
            </span>
            {item.grade ? <span className="text-foreground/75">Grade {item.grade}</span> : null}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:shrink-0 sm:justify-end">
        {left !== null && !done ? (
          <span
            className={cn(
              "rounded-full border px-2.5 py-1 text-xs",
              overdue ? "border-destructive/30 bg-destructive/5 text-destructive" : "border-border text-muted-foreground"
            )}
          >
            {countdownText(left)}
          </span>
        ) : null}

        <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", STATUS_STYLE[item.status])}>
          {item.status}
        </span>

        {item.status !== "Graded" ? (
          <button
            type="button"
            onClick={() => onToggle(item.id)}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-foreground transition-colors duration-200 hover:border-primary/40 hover:bg-secondary"
          >
            {done ? <RotateCcw className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
            {done ? "Undo submit" : "Mark submitted"}
          </button>
        ) : null}
      </div>
    </li>
  );
}