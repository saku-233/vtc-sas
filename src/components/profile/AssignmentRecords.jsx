import { format, parseISO } from "date-fns";
import { enUS } from "date-fns/locale";
import { dueLabel } from "@/lib/assignments";

const STATUS_STYLE = {
  "Not Started": "bg-secondary text-secondary-foreground",
  "In Progress": "bg-[hsl(38_78%_92%)] text-[hsl(28_68%_30%)]",
  "Submitted": "bg-[hsl(168_40%_92%)] text-[hsl(168_45%_24%)]",
  "Graded": "bg-[hsl(212_42%_93%)] text-[hsl(215_42%_30%)]",
};

export default function AssignmentRecords({ assignments, courses }) {
  if (!assignments.length) {
    return <p className="text-sm text-muted-foreground">No assignment records yet.</p>;
  }
  const courseMap = new Map(courses.map((c) => [c.code, c]));
  const sorted = [...assignments].sort((a, b) => (b.due ?? "").localeCompare(a.due ?? ""));

  return (
    <div className="overflow-hidden rounded-2xl border border-border/80 bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary/50 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Course</th>
              <th className="px-4 py-3 font-medium">Assignment</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Weight</th>
              <th className="px-4 py-3 font-medium">Due</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Grade</th>
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
                        <p>{format(parseISO(a.due), "yyyy-MM-dd", { locale: enUS })}</p>
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