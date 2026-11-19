import { useState } from "react";
import { Clock, MapPin, Users } from "lucide-react";
import ClassDetailsDialog from "./ClassDetailsDialog";

const WEEKDAY_ORDER = ["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"];

export default function TimetablePanel({ courses }) {
  const [active, setActive] = useState(null);

  const grouped = WEEKDAY_ORDER.map((day) => ({
    day,
    items: courses
      .filter((c) => c.scheduleDay === day && c.startTime && c.endTime)
      .sort((a, b) => a.startTime.localeCompare(b.startTime)),
  })).filter((g) => g.items.length > 0);

  return (
    <section className="rounded-2xl border border-border/80 bg-card p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-base text-foreground">课程时间表</h3>
        <span className="text-[11px] tracking-wide text-muted-foreground">{courses.length} 门</span>
      </div>

      {grouped.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">还没有课程排程。</p>
      ) : (
        <div className="mt-4 space-y-4">
          {grouped.map((g) => (
            <div key={g.day}>
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground/80">{g.day}</p>
              <ul className="mt-1.5 space-y-1.5">
                {g.items.map((c) => (
                  <li key={c.id} className="flex items-stretch gap-2.5 rounded-xl border border-border/60 bg-background/40 p-2.5">
                    <span className="w-1 rounded-full" style={{ backgroundColor: c.color ?? "#94A3B8" }} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 text-[13px] font-medium text-foreground">
                        <span className="truncate">{c.name}</span>
                        <span className="text-muted-foreground/70">· {c.code}</span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{c.startTime}–{c.endTime}</span>
                        {c.room ? <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{c.room}</span> : null}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActive(c)}
                      className="inline-flex shrink-0 items-center gap-1 self-center rounded-full border border-border px-2 py-1 text-[11px] text-foreground transition-colors hover:border-primary/40 hover:bg-secondary"
                      title="查看班级详情"
                    >
                      <Users className="h-3 w-3" />
                      {c.students ?? 0}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <p className="mt-4 text-[11px] text-muted-foreground/80">点击学生人数查看班级详情。</p>

      <ClassDetailsDialog course={active} onClose={() => setActive(null)} />
    </section>
  );
}