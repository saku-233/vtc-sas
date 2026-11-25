import { format, parseISO } from "date-fns";
import { zhCN } from "date-fns/locale";
import { AttendanceBadge } from "@/components/attendance/AttendanceSummary";

export default function AttendanceByCourse({ courses, attendance }) {
  const byCode = {};
  attendance.forEach((row) => {
    (byCode[row.courseCode] ??= []).push(row);
  });

  return (
    <div className="space-y-6">
      {courses.map((course) => {
        const rows = (byCode[course.code] ?? []).slice().sort((a, b) => b.date.localeCompare(a.date));
        return (
          <section key={course.code} className="rounded-2xl border border-border/80 bg-card p-5">
            <div className="flex items-center gap-3">
              <span className="h-8 w-1 rounded-full" style={{ backgroundColor: course.color }} />
              <div>
                <h3 className="font-heading text-base text-foreground">{course.name}</h3>
                <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">{course.code}</p>
              </div>
            </div>
            {rows.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">暂无出席记录。</p>
            ) : (
              <ul className="mt-4 divide-y divide-border/70">
                {rows.map((row) => (
                  <li key={row.id} className="flex items-center justify-between py-2.5">
                    <div className="flex min-w-0 items-center gap-2 text-sm text-foreground/85">
                      <span className="shrink-0">{format(parseISO(row.date), "M月d日 EEEE", { locale: zhCN })}</span>
                      {row.student ? (
                        <span className="truncate text-muted-foreground">
                          · {row.student}{row.studentId ? `（${row.studentId}）` : ""}
                        </span>
                      ) : null}
                    </div>
                    <AttendanceBadge status={row.status} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}