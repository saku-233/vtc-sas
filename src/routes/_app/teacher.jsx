import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, ClipboardList, CalendarCheck, Users } from "lucide-react";
import { listCourses, listAssignments, listAttendance } from "@/lib/server-fns";
import PageHeader from "@/components/PageHeader";
import CourseHistory from "@/components/profile/CourseHistory";
import AssignmentRecords from "@/components/profile/AssignmentRecords";
import AttendanceOverview from "@/components/profile/AttendanceOverview";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const Route = createFileRoute("/_app/teacher")({
  head: () => ({ meta: [{ title: "教师后台 · VTC-SAS" }] }),
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
  // 选课学生人数：取课程中 students 字段的最大值近似，或按有选课记录的课程数
  const enrolledStudents = courses.reduce((max, c) => Math.max(max, c.students ?? 0), 0);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Teacher Account Backend"
        title="教师后台"
        description="查看全体学生的选课历史、作业记录与累计出席统计。"
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

      <Tabs defaultValue="courses" className="w-full">
        <TabsList className="grid w-full grid-cols-3 sm:w-auto">
          <TabsTrigger value="courses">选课历史</TabsTrigger>
          <TabsTrigger value="assignments">作业记录</TabsTrigger>
          <TabsTrigger value="attendance">出席统计</TabsTrigger>
        </TabsList>
        <TabsContent value="courses" className="mt-5">
          <CourseHistory courses={courses} />
        </TabsContent>
        <TabsContent value="assignments" className="mt-5">
          <AssignmentRecords assignments={assignments} courses={courses} />
        </TabsContent>
        <TabsContent value="attendance" className="mt-5">
          <AttendanceOverview courses={courses} attendance={attendance} />
        </TabsContent>
      </Tabs>
    </div>
  );
}