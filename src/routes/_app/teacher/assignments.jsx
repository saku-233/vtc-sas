import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/PageHeader";
import { listAssignments, listCourses } from "@/lib/server-fns";
import { dueLabel } from "@/lib/assignments";
import { teacherOnly } from "@/lib/routeGuards";

export const Route = createFileRoute("/_app/teacher/assignments")({
  head: () => ({ meta: [{ title: "我发布的作业 · VTC-SAS" }, { name: "description", content: "已布置的全部作业、截止日期与占比。" }] }),
  beforeLoad: teacherOnly,
  loader: async () => {
    const [courses, assignments] = await Promise.all([listCourses(), listAssignments()]);
    return { courses, assignments };
  },
  component: TeacherAssignmentsPage,
});

const STATUS_STYLE = {
  未开始: "bg-secondary text-secondary-foreground",
  进行中: "bg-[hsl(38_78%_92%)] text-[hsl(28_68%_30%)]",
  已提交: "bg-[hsl(168_40%_92%)] text-[hsl(168_45%_24%)]",
  已评分: "bg-[hsl(212_42%_93%)] text-[hsl(215_42%_30%)]",
};

function TeacherAssignmentsPage() {
  const { courses, assignments } = Route.useLoaderData();
  const courseByCode = Object.fromEntries(courses.map((c) => [c.code, c]));
  const sorted = [...assignments].sort((a, b) => a.due.localeCompare(b.due));

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="2026 秋季学期"
        title="我发布的作业"
        description="已布置的全部作业、截止日期、占总评比重与学生提交状态。"
      />

      {sorted.length === 0 ? (
        <p className="text-sm text-muted-foreground">还没有发布作业。</p>
      ) : (
        <ul className="space-y-3">
          {sorted.map((item) => {
            const course = courseByCode[item.courseCode];
            return (
              <li key={item.id} className="flex flex-col gap-4 rounded-2xl border border-border/80 bg-card p-5 sm:flex-row sm:items-center sm:gap-6">
                <div className="flex min-w-0 flex-1 items-start gap-4">
                  <span className="mt-1 h-10 w-1 shrink-0 rounded-full opacity-80" style={{ backgroundColor: course?.color ?? "#94A3B8" }} />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] tracking-[0.12em] text-muted-foreground">
                      <span className="font-medium uppercase">{course?.code}</span>
                      <span className="text-muted-foreground/60">·</span>
                      <span className="tracking-normal">{course?.name}</span>
                    </div>
                    <h3 className="mt-1 truncate font-heading text-[17px] leading-snug text-foreground">{item.title}</h3>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                      <span>{item.type}</span>
                      <span>占总评 {item.weight}%</span>
                      <span>{dueLabel(item.due)}</span>
                    </div>
                  </div>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLE[item.status] ?? "bg-secondary text-secondary-foreground"}`}>
                  {item.status}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}