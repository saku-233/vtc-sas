import { createFileRoute } from "@tanstack/react-router";
import { GraduationCap, ClipboardList, CalendarCheck, TrendingUp } from "lucide-react";
import { listCourses, listAssignments, listAttendance } from "@/lib/server-fns";
import { studentOnly } from "@/lib/routeGuards";
import PageHeader from "@/components/PageHeader";
import CourseHistory from "@/components/profile/CourseHistory";
import AssignmentRecords from "@/components/profile/AssignmentRecords";
import AttendanceOverview from "@/components/profile/AttendanceOverview";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const Route = createFileRoute("/_app/profile")({
  head: () => ({ meta: [{ title: "我的档案 · VTC-SAS" }] }),
  loader: async () => {
    const [courses, assignments, attendance] = await Promise.all([
      listCourses(),
      listAssignments(),
      listAttendance(),
    ]);
    return { courses, assignments, attendance };
  },
  beforeLoad: studentOnly,
  component: ProfilePage,
});

const SUBMITTED = new Set(["已提交", "已评分"]);
function parseGrade(g) {
  if (!g) return null;
  const n = parseFloat(g);
  return Number.isFinite(n) ? n : null;
}

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

function ProfilePage() {
  const { courses, assignments, attendance } = Route.useLoaderData();

  const totalCourses = courses.length;
  const totalAssignments = assignments.length;
  const presentCount = attendance.filter((a) => a.status === "出席").length;
  const attendanceRate = attendance.length ? Math.round((presentCount / attendance.length) * 100) : 0;
  const grades = assignments.map((a) => parseGrade(a.grade)).filter((n) => n !== null);
  const avgGrade = grades.length ? Math.round((grades.reduce((s, n) => s + n, 0) / grades.length) * 10) / 10 : null;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Student Account Backend"
        title="我的学业档案"
        description="集中查看你的选课历史、作业记录与累计出席统计。"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={GraduationCap} label="选课总数" value={totalCourses} sub="本学期已选课程" />
        <StatCard icon={ClipboardList} label="作业总数" value={totalAssignments} sub={`${assignments.filter((a) => SUBMITTED.has(a.status)).length} 份已提交`} />
        <StatCard icon={CalendarCheck} label="出席率" value={`${attendanceRate}%`} sub={`${presentCount} / ${attendance.length} 节`} accent="text-emerald-600" />
        <StatCard icon={TrendingUp} label="平均成绩" value={avgGrade !== null ? avgGrade : "—"} sub={avgGrade !== null ? "分（已评分作业）" : "暂无评分"} accent="text-blue-600" />
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