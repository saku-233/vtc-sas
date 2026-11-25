import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, ClipboardList, CalendarCheck, Users } from "lucide-react";
import { listCourses, listAssignments, listAttendance } from "@/lib/server-fns";
import PageHeader from "@/components/PageHeader";
import CourseTable from "@/components/teacher/CourseTable";
import { teacherOnly } from "@/lib/routeGuards";

export const Route = createFileRoute("/_app/teacher/")({
  head: () => ({ meta: [{ title: "教师后台 · VTC-SAS" }] }),
  beforeLoad: teacherOnly,
  loader: async () => {
    const [courses, assignments, attendance] = await Promise.all([
      listCourses(),
      listAssignments(),
      listAttendance(),
    ]);
    return { courses, assignments, attendance };
  },
  component: TeacherPage,
});

function StatCard({ icon: Icon, label, value, sub, accent }) {
  return (
    <div className="rounded-2xl border border-border/80 bg-card p-5">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className={`h-4 w-4 ${accent ?? "text-primary"}`} />
        <span className="text-xs font-medium uppercase tracking-[0.16em]">{label}</span>
      </div>
      <p className="mt-2 font-heading text-[28px] leading-none text-foreground">{value}</p>
      {sub ? <p className="mt-1 text-[11px] text-muted-foreground/80">{sub}</p> : null}
    </div>
  );
}

function TeacherPage() {
  const { courses, assignments, attendance } = Route.useLoaderData();

  const totalCourses = courses.length;
  const totalAssignments = assignments.length;
  const presentCount = attendance.filter((a) => a.status === "出席").length;
  const attendanceRate = attendance.length ? Math.round((presentCount / attendance.length) * 100) : 0;
  const enrolledStudents = courses.reduce((sum, c) => sum + (c.students ?? 0), 0);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Teacher Account Backend"
        title="教师后台"
        description="查看全体课程进度、作业布置与累计出席统计。"
      >
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary">
          <Users className="h-3.5 w-3.5" />
          教师视图
        </span>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={BookOpen} label="开设课程" value={totalCourses} sub="本学期开设科目" />
        <StatCard icon={ClipboardList} label="作业总数" value={totalAssignments} sub="已布置的全部作业" accent="text-amber-600" />
        <StatCard icon={CalendarCheck} label="总体出席率" value={`${attendanceRate}%`} sub={`${presentCount} / ${attendance.length} 节`} accent="text-emerald-600" />
        <StatCard icon={Users} label="选课学生" value={enrolledStudents || "—"} sub="累计选课人次" accent="text-blue-600" />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg text-foreground">课程进度概览</h2>
          <span className="text-xs text-muted-foreground">共 {courses.length} 门课程</span>
        </div>
        <CourseTable courses={courses} assignments={assignments} />
      </div>
    </div>
  );
}