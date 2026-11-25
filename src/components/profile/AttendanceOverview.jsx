import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import AttendanceSummary from "@/components/attendance/AttendanceSummary";
import AttendanceByCourse from "@/components/attendance/AttendanceByCourse";

const STATUS_COLOR = {
  出席: "#2f9e6f",
  迟到: "#d99a3c",
  请假: "#7c6fb0",
  缺席: "#d6534a",
};

export default function AttendanceOverview({ courses, attendance }) {
  const total = attendance.length;
  const counts = { 出席: 0, 迟到: 0, 请假: 0, 缺席: 0 };
  attendance.forEach((r) => {
    counts[r.status] = (counts[r.status] ?? 0) + 1;
  });
  const chartData = Object.entries(counts).map(([status, count]) => ({ status, count }));

  // per-course attendance rate
  const byCode = {};
  attendance.forEach((r) => {
    (byCode[r.courseCode] ??= []).push(r);
  });
  const perCourse = courses
    .map((c) => {
      const rows = byCode[c.code] ?? [];
      const present = rows.filter((r) => r.status === "出席").length;
      const rate = rows.length ? Math.round((present / rows.length) * 100) : 0;
      return { name: c.name, code: c.code, rate, total: rows.length };
    })
    .filter((r) => r.total > 0);

  return (
    <div className="space-y-6">
      <AttendanceSummary attendance={attendance} />

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-border/80 bg-card p-5">
          <h3 className="font-heading text-base text-foreground">出席状态分布</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">本学期累计 {total} 节课</p>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="status" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip
                  cursor={{ fill: "hsl(var(--secondary))" }}
                  contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", fontSize: 12 }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {chartData.map((d) => (
                    <Cell key={d.status} fill={STATUS_COLOR[d.status] ?? "#94A3B8"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-2xl border border-border/80 bg-card p-5">
          <h3 className="font-heading text-base text-foreground">各科出席率</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">按课程统计的出席百分比</p>
          {perCourse.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">暂无出席数据。</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {perCourse.map((r) => (
                <li key={r.code}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{r.name}</span>
                    <span className="text-muted-foreground">{r.rate}%</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full rounded-full bg-primary transition-[width] duration-500" style={{ width: `${r.rate}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section>
        <h3 className="mb-3 font-heading text-base text-foreground">按课程查看明细</h3>
        <AttendanceByCourse courses={courses} attendance={attendance} />
      </section>
    </div>
  );
}