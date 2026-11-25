import { format, parseISO } from "date-fns";
import { zhCN } from "date-fns/locale";
import { dueLabel } from "@/lib/assignments";

const STATUS_STYLE = {
  未开始: "bg-secondary text-secondary-foreground",
  进行中: "bg-[hsl(38_78%_92%)] text-[hsl(28_68%_30%)]",
  已提交: "bg-[hsl(168_40%_92%)] text-[hsl(168_45%_24%)]",
  已评分: "bg-[hsl(212_42%_93%)] text-[hsl(215_42%_30%)]",
};

export default function AssignmentRecords({ assignments, courses }) {
  if (!assignments.length) {
    return <p className="text-sm text-muted-foreground">暂无作业记录。</p>;
  }
  const courseMap = new Map(courses.map((c) => [c.code, c]));
  const sorted = [...assignments].sort((a, b) => (b.due ?? "").localeCompare(a.due ?? ""));

  return (
    <div className="overflow-hidden rounded-2xl border border-border/80 bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary/50 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">课程</th>
              <th className="px-4 py-3 font-medium">作业</th>
              <th className="px-4 py-3 font-medium">类型</th>
              <th className="px-4 py-3 font-medium">占比</th>
              <th className="px-4 py-3 font-medium">截止</th>
              <th className="px-4 py-3 font-medium">状态</th>
              <th className="px-4 py-3 font-medium">成绩</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/70">
            {sorted.map((a) => {
              const course = courseMap.get(a.courseCode);
              return (
                <tr key={a.id} className="align-top transition-colors hover:bg-secondary/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="h-7 w-1 rounded-full" style={{ backgroundColor: course?.color ?? "#94A3B8" }} />
                      <div>
                        <p className="font-medium text-foreground">{course?.name ?? a.courseCode}</p>
                        <p className="text-[11px] text-muted-foreground">{a.courseCode}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">{a.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{a.type ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{a.weight ? `${a.weight}%` : "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {a.due ? (
                      <div>
                        <p>{format(parseISO(a.due), "yyyy-MM-dd", { locale: zhCN })}</p>
                        <p className="text-[11px] text-muted-foreground/80">{dueLabel(a.due)}</p>
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLE[a.status] ?? "bg-secondary text-secondary-foreground"}`}>
                      {a.status ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground/85">{a.grade ?? "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}