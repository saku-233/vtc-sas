import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { studentOnly } from "@/lib/routeGuards";
import PageHeader from "@/components/PageHeader";
import TimetablePanel from "@/components/home/TimetablePanel";
import SubjectStatsPanel from "@/components/home/SubjectStatsPanel";
import { listAssignments, listCourses } from "@/lib/server-fns";
import { dueLabel, DONE_STATUSES } from "@/lib/assignments";

export const Route = createFileRoute("/_app/")({
  head: () => ({
    meta: [
      { title: "首页 · VTC-SAS" },
      { name: "description", content: "课程、作业、出席与学习助手，集中在一个学生门户。" },
    ],
  }),
  beforeLoad: studentOnly,
  loader: async () => {
    const [courses, assignments] = await Promise.all([listCourses(), listAssignments()]);
    return { courses, assignments };
  },
  component: HomePage,
});

const SECTIONS = [
  { to: "/courses", title: "我的课程", text: "本学期的科目与上课时间。" },
  { to: "/assignments", title: "我的作业", text: "截止日期、比重与提交状态。" },
  { to: "/attendance", title: "出席", text: "每节课的出席记录与统计。" },
  { to: "/chat", title: "Chatbot", text: "用对话查询你的学业安排。" },
];

function HomePage() {
  const { courses, assignments } = Route.useLoaderData();
  const courseByCode = Object.fromEntries(courses.map((c) => [c.code, c]));
  const next = [...assignments]
    .filter((item) => !DONE_STATUSES.includes(item.status))
    .sort((a, b) => a.due.localeCompare(b.due))[0];

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="VTC-SAS"
        title="把学业收进一个页面"
        description="课程、作业与出席不再分散在 Moodle、邮件和试算表之间。"
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          {next ? (
            <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8">
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-primary/70">最近到期</p>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="font-heading text-2xl leading-snug text-foreground">{next.title}</h2>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {courseByCode[next.courseCode]?.name} · {dueLabel(next.due)} · 占总评 {next.weight}%
                  </p>
                </div>
                <Link
                  to="/assignments"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-opacity hover:opacity-70"
                >
                  查看全部作业
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            {SECTIONS.map((section) => (
              <Link
                key={section.to}
                to={section.to}
                className="group rounded-2xl border border-border/80 bg-card p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_20px_44px_-30px_rgba(20,40,35,0.5)]"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-heading text-lg text-foreground">{section.title}</h3>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </div>
                <p className="mt-1.5 text-sm text-muted-foreground">{section.text}</p>
              </Link>
            ))}
          </div>

          <SubjectStatsPanel courses={courses} assignments={assignments} />
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <TimetablePanel courses={courses} />
        </aside>
      </div>
    </div>
  );
}