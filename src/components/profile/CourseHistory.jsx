import { BookOpen } from "lucide-react";

const DAY_ORDER = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];

export default function CourseHistory({ courses }) {
  if (!courses.length) {
    return <p className="text-sm text-muted-foreground">暂无选课记录。</p>;
  }
  const sorted = [...courses].sort((a, b) => {
    const da = DAY_ORDER.indexOf(a.scheduleDay);
    const db = DAY_ORDER.indexOf(b.scheduleDay);
    return (da < 0 ? 99 : da) - (db < 0 ? 99 : db) || (a.startTime ?? "").localeCompare(b.startTime ?? "");
  });

  return (
    <ol className="relative space-y-3 border-l border-border/70 pl-5">
      {sorted.map((c) => (
        <li key={c.id} className="relative">
          <span
            className="absolute -left-[26px] top-1.5 h-3 w-3 rounded-full ring-4 ring-background"
            style={{ backgroundColor: c.color ?? "#94A3B8" }}
          />
          <div className="rounded-2xl border border-border/80 bg-card p-4 transition-colors hover:border-primary/30">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                  <span className="font-medium">{c.code}</span>
                </div>
                <h3 className="mt-0.5 font-heading text-base text-foreground">{c.name}</h3>
              </div>
              <span className="rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground">
                {c.credits ? `${c.credits} 学分` : "选修"}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
              {c.scheduleDay ? (
                <span className="inline-flex items-center gap-1">
                  <BookOpen className="h-3.5 w-3.5" />
                  {c.scheduleDay} {c.startTime}-{c.endTime}
                </span>
              ) : null}
              {c.instructor ? <span>教师 · {c.instructor}</span> : null}
              {c.room ? <span>课室 · {c.room}</span> : null}
              {c.students ? <span>选课人数 · {c.students}</span> : null}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}