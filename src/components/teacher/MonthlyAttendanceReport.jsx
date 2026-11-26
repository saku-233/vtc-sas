import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { enUS } from "date-fns/locale";
import { AlertTriangle, TrendingDown, Users } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const FOCUS_THRESHOLD = 80;

function monthKey(dateStr) {
  return (dateStr ?? "").slice(0, 7); // YYYY-MM
}

function buildStudentStats(rows) {
  const map = {};
  rows.forEach((row) => {
    const name = (row.student ?? "").trim() || "Unassigned";
    const s = (map[name] ??= { name, total: 0, Present: 0, Late: 0, Excused: 0, Absent: 0 });
    s.total += 1;
    if (s[row.status] !== undefined) s[row.status] += 1;
  });
  return Object.values(map).map((s) => {
    const rate = s.total ? Math.round((s.Present / s.total) * 100) : 0;
    return { ...s, rate, absent: s.Absent };
  });
}

export default function MonthlyAttendanceReport({ attendance, courses }) {
  const availableMonths = useMemo(() => {
    const set = new Set();
    attendance.forEach((row) => {
      const k = monthKey(row.date);
      if (k) set.add(k);
    });
    const list = [...set].sort((a, b) => b.localeCompare(a));
    return list;
  }, [attendance]);

  const [month, setMonth] = useState(availableMonths[0] ?? "");

  const activeMonth = month || availableMonths[0] || "";

  const monthRows = useMemo(
    () => attendance.filter((row) => monthKey(row.date) === activeMonth),
    [attendance, activeMonth]
  );

  const stats = useMemo(() => buildStudentStats(monthRows), [monthRows]);

  const focused = useMemo(
    () => stats.filter((s) => s.total > 0 && s.rate < FOCUS_THRESHOLD).sort((a, b) => a.rate - b.rate),
    [stats]
  );

  const monthLabel = activeMonth ? format(parseISO(`${activeMonth}-01`), "MMMM yyyy", { locale: enUS }) : "This month";

  return (
    <section className="rounded-2xl border border-border/80 bg-card p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <TrendingDown className="h-4 w-4 text-primary" />
          <h3 className="font-heading text-base text-foreground">Monthly attendance report</h3>
        </div>
        <div className="w-full sm:w-[200px]">
          <Select value={activeMonth} onValueChange={setMonth}>
            <SelectTrigger className="h-9"><SelectValue placeholder="Select month" /></SelectTrigger>
            <SelectContent>
              {availableMonths.length === 0 ? (
                <SelectItem value={null} disabled>No data</SelectItem>
              ) : (
                availableMonths.map((m) => (
                  <SelectItem key={m} value={m}>{format(parseISO(`${m}-01`), "MMMM yyyy", { locale: enUS })}</SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Students to watch */}
      <div className="mt-5 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
        <div className="flex items-center gap-2 text-foreground">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <h4 className="font-medium text-sm">Students to watch (attendance below {FOCUS_THRESHOLD}%)</h4>
          <span className="rounded-full bg-destructive/15 px-2 py-0.5 text-[11px] font-semibold text-destructive">{focused.length}</span>
        </div>
        {focused.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">{monthLabel}: no students need attention.</p>
        ) : (
          <ul className="mt-3 flex flex-wrap gap-2">
            {focused.map((s) => (
              <li key={s.name} className="flex items-center gap-2 rounded-full border border-destructive/30 bg-card px-3 py-1.5 text-sm">
                <span className="font-medium text-foreground">{s.name}</span>
                <span className="text-[11px] text-muted-foreground">absent {s.absent}</span>
                <span className="text-[11px] font-semibold text-destructive">{s.rate}%</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Monthly detail table */}
      <div className="mt-5 overflow-x-auto">
        {stats.length === 0 ? (
          <p className="text-sm text-muted-foreground">{monthLabel}: no attendance records.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
              <tr>
                <th className="px-3 py-3 font-medium">Student</th>
                <th className="px-3 py-3 font-medium text-right">Sessions</th>
                <th className="px-3 py-3 font-medium text-right">Present</th>
                <th className="px-3 py-3 font-medium text-right">Late</th>
                <th className="px-3 py-3 font-medium text-right">Excused</th>
                <th className="px-3 py-3 font-medium text-right">Absent</th>
                <th className="px-3 py-3 font-medium text-right">Rate</th>
                <th className="px-3 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {stats
                .slice()
                .sort((a, b) => a.rate - b.rate)
                .map((s) => {
                  const isFocus = s.total > 0 && s.rate < FOCUS_THRESHOLD;
                  return (
                    <tr key={s.name} className={isFocus ? "bg-destructive/5" : ""}>
                      <td className="px-3 py-2.5 align-middle">
                        <div className="flex items-center gap-2">
                          <span className="grid h-7 w-7 place-items-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                            {s.name.charAt(0).toUpperCase()}
                          </span>
                          <span className="text-foreground">{s.name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-right align-middle text-muted-foreground">{s.total}</td>
                      <td className="px-3 py-2.5 text-right align-middle text-emerald-600">{s.Present}</td>
                      <td className="px-3 py-2.5 text-right align-middle text-amber-600">{s.Late}</td>
                      <td className="px-3 py-2.5 text-right align-middle text-purple-600">{s.Excused}</td>
                      <td className="px-3 py-2.5 text-right align-middle text-red-500">{s.Absent}</td>
                      <td className="px-3 py-2.5 text-right align-middle font-medium text-foreground">{s.rate}%</td>
                      <td className="px-3 py-2.5 align-middle">
                        {isFocus ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-destructive/15 px-2 py-0.5 text-[11px] font-medium text-destructive">
                            <AlertTriangle className="h-3 w-3" /> Watch
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                            <Users className="h-3 w-3" /> OK
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}