import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

/**
 * 教师后台课程表格：课程名称 / 进度 / 学生人数 / 操作（详情）
 * progress = 该课程下已提交或已评分的作业占比
 */
export default function CourseTable({ courses, assignments }) {
  const rows = courses.map((c) => {
    const courseAssigns = assignments.filter((a) => a.courseCode === c.code);
    const done = courseAssigns.filter((a) => a.status === "已提交" || a.status === "已评分").length;
    const total = courseAssigns.length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    return { ...c, pct, done, total };
  });

  if (!rows.length) {
    return (
      <div className="rounded-2xl border border-border/80 bg-card p-10 text-center text-sm text-muted-foreground">
        暂无课程数据
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/80 bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/80 bg-muted/40 text-left text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            <th className="px-5 py-3.5">课程名称</th>
            <th className="px-5 py-3.5">进度</th>
            <th className="px-5 py-3.5">学生人数</th>
            <th className="px-5 py-3.5 text-right">操作</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => (
            <tr key={c.id ?? c.code} className="border-b border-border/60 last:border-0 hover:bg-muted/30">
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color || "hsl(var(--primary))" }} />
                  <div>
                    <p className="font-medium text-foreground">{c.name}</p>
                    <p className="text-[11px] text-muted-foreground">{c.code} · {c.instructor || "—"}</p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-1.5 w-28 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${c.pct}%` }} />
                  </div>
                  <span className="tabular-nums text-muted-foreground">{c.pct}%</span>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground/80">{c.done} / {c.total} 作业</p>
              </td>
              <td className="px-5 py-4 tabular-nums text-foreground">{c.students ?? "—"}</td>
              <td className="px-5 py-4 text-right">
                <Link
                  to="/courses"
                  className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                >
                  详情
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}