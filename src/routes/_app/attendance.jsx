import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/PageHeader";
import AttendanceSummary from "@/components/attendance/AttendanceSummary";
import AttendanceByCourse from "@/components/attendance/AttendanceByCourse";
import { listAttendance, listCourses } from "@/lib/server-fns";

export const Route = createFileRoute("/_app/attendance")({
  head: () => ({ meta: [{ title: "出席 · VTC-SAS" }, { name: "description", content: "每节课的出席记录与整体出席率。" }] }),
  loader: async () => {
    const [courses, attendance] = await Promise.all([listCourses(), listAttendance()]);
    return { courses, attendance };
  },
  component: AttendancePage,
});

function AttendancePage() {
  const { courses, attendance } = Route.useLoaderData();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="2026 秋季学期"
        title="出席"
        description="每节课的出席记录与整体出席率，按科目分组。"
      />
      <AttendanceSummary attendance={attendance} />
      <AttendanceByCourse courses={courses} attendance={attendance} />
    </div>
  );
}