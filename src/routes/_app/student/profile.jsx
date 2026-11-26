import { createFileRoute } from "@tanstack/react-router";
import { GraduationCap, ClipboardList, CalendarCheck, TrendingUp } from "lucide-react";
import { listCourses, listAssignments, listAttendance } from "@/lib/server-fns";
import { studentOnly } from "@/lib/routeGuards";
import PageHeader from "@/components/PageHeader";
import CourseHistory from "@/components/profile/CourseHistory";
import AssignmentRecords from "@/components/profile/AssignmentRecords";
import AttendanceOverview from "@/components/profile/AttendanceOverview";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const Route = createFileRoute("/_app/student/profile")({
  head: () => ({ meta: [{ title: "My Profile · VTC-SAS" }] }),
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

const SUBMITTED = new Set(["Submitted", "Graded"]);
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
  const presentCount = attendance.filter((a) => a.status === "Present").length;
  const attendanceRate = attendance.length ? Math.round((presentCount / attendance.length) * 100) : 0;
  const grades = assignments.map((a) => parseGrade(a.grade)).filter((n) => n !== null);
  const avgGrade = grades.length ? Math.round((grades.reduce((s, n) => s + n, 0) / grades.length) * 10) / 10 : null;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Student Account"
        title="My Academic Profile"
        description="Your course history, assignment records and cumulative attendance in one place."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={GraduationCap} label="Courses" value={totalCourses} sub="Enrolled this semester" />
        <StatCard icon={ClipboardList} label="Assignments" value={totalAssignments} sub={`${assignments.filter((a) => SUBMITTED.has(a.status)).length} submitted`} />
        <StatCard icon={CalendarCheck} label="Attendance rate" value={`${attendanceRate}%`} sub={`${presentCount} / ${attendance.length} sessions`} accent="text-emerald-600" />
        <StatCard icon={TrendingUp} label="Avg grade" value={avgGrade !== null ? avgGrade : "—"} sub={avgGrade !== null ? "pts (graded assignments)" : "No grades yet"} accent="text-blue-600" />
      </div>

      <Tabs defaultValue="courses" className="w-full">
        <TabsList className="grid w-full grid-cols-3 sm:w-auto">
          <TabsTrigger value="courses">Course history</TabsTrigger>
          <TabsTrigger value="assignments">Assignment records</TabsTrigger>
          <TabsTrigger value="attendance">Attendance stats</TabsTrigger>
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