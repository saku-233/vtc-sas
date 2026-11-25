import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/PageHeader";
import AttendanceSummary from "@/components/attendance/AttendanceSummary";
import AttendanceByCourse from "@/components/attendance/AttendanceByCourse";
import { listAttendance, listCourses } from "@/lib/server-fns";
import { teacherOnly } from "@/lib/routeGuards";

export const Route = createFileRoute("/_app/teacher/attendance")({
  head: () => ({ meta: [{ title: "出席总览 · VTC-SAS" }, { name: "description", content: "各课程的学生出席记录与整体出席率。" }] }),
  beforeLoad: teacherOnly,
  loader: async () => {
    const [courses, attendance] = await Promise.all([listCourses(), listAttendance()]);
    return { courses, attendance };
  },
  component: TeacherAttendancePage,
});

function TeacherAttendancePage() {
  const { courses, attendance } = Route.useLoaderData();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="2026 秋季学期"
        title="出席总览"
        description="各课程的学生出席记录与整体出席率，按科目分组。"
      />
      <AttendanceSummary attendance={attendance} />
      <AttendanceByCourse courses={courses} attendance={attendance} />
    </div>
  );
}