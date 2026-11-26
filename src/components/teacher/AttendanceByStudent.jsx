import { format, parseISO } from "date-fns";
import { enUS } from "date-fns/locale";
import { CheckCircle2, XCircle, Clock, FileText } from "lucide-react";
import { AttendanceBadge } from "@/components/attendance/AttendanceSummary";

const STATUS_ICON = {
  Present: { icon: CheckCircle2, className: "text-emerald-600" },
  Absent: { icon: XCircle, className: "text-red-500" },
  Late: { icon: Clock, className: "text-amber-600" },
  Excused: { icon: FileText, className: "text-purple-600" },
};

export default function AttendanceByStudent({ attendance, courses }) {
  const courseByCode = Object.fromEntries(courses.map((c) => [c.code, c]));
  const byStudent = {};
  attendance.forEach((row) => {
    const name = (row.student ?? "").trim() || "Unassigned";
    (byStudent[name] ??= []).push(row);
  });
  const students = Object.entries(byStudent).sort(([a], [b]) => a.localeCompare(b, "en"));

  if (students.length === 0) {
    return <p className="text-sm text-muted-foreground">No attendance records yet.</p>;
  }

  return (
    <div className="space-y-4">
      {students.map(([name, rows]) => {
        const total = rows.length;
        const present = rows.filter((r) => r.status === "Present").length;
        const absent = rows.filter((r) => r.status === "Absent").length;
        const rate = total ? Math.round((present / total) * 100) : 0;
        const sorted = rows.slice().sort((a, b) => b.date.localeCompare(a.date));
        const rateStyle =
          rate >= 80
            ? "bg-[hsl(152_40%_92%)] text-[hsl(150_42%_26%)]"
            : rate >= 50
            ? "bg-[hsl(38_78%_92%)] text-[hsl(28_68%_30%)]"
            : "bg-[hsl(0_68%_94%)] text-[hsl(0_60%_38%)]";

        return (
          <section key={name} className="rounded-2xl border border-border/80 bg-card p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {name.charAt(0).toUpperCase()}
                </span>
                <div>
                  <h3 className="font-heading text-base text-foreground">{name}</h3>
                  <p className="text-[11px] text-muted-foreground">
                    {rows[0]?.studentId ? `ID ${rows[0].studentId} · ` : ""}{total} sessions · present {present} · absent {absent}
                  </p>
                </div>
              </div>
              <span className={`rounded-full px-3 py-1 text-sm font-medium ${rateStyle}`}>
                {rate}% present
              </span>
            </div>

            <ul className="mt-4 divide-y divide-border/70">
              {sorted.map((row) => {
                const meta = STATUS_ICON[row.status];
                const Icon = meta?.icon;
                return (
                  <li key={row.id} className="flex items-center justify-between py-2.5">
                    <div className="flex min-w-0 items-center gap-2 text-sm text-foreground/85">
                      {Icon ? <Icon className={`h-4 w-4 shrink-0 ${meta.className}`} /> : null}
                      <span className="shrink-0">{format(parseISO(row.date), "MMM d, EEEE", { locale: enUS })}</span>
                      <span className="truncate text-muted-foreground">· {courseByCode[row.courseCode]?.name ?? row.courseCode}</span>
                    </div>
                    <AttendanceBadge status={row.status} />
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}