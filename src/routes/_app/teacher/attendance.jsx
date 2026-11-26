import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import AttendanceSummary from "@/components/attendance/AttendanceSummary";
import AttendanceByStudent from "@/components/teacher/AttendanceByStudent";
import MonthlyAttendanceReport from "@/components/teacher/MonthlyAttendanceReport";
import { listAttendance, listCourses } from "@/lib/server-fns";
import { teacherOnly } from "@/lib/routeGuards";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_app/teacher/attendance")({
  head: () => ({ meta: [{ title: "Attendance Overview · VTC-SAS" }, { name: "description", content: "Student attendance records and overall attendance rate per course." }] }),
  beforeLoad: teacherOnly,
  loader: async () => {
    const [courses, attendance] = await Promise.all([listCourses(), listAttendance()]);
    return { courses, attendance };
  },
  component: TeacherAttendancePage,
});

function TeacherAttendancePage() {
  const { courses, attendance } = Route.useLoaderData();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return attendance;
    return attendance.filter((row) => {
      const id = (row.studentId ?? "").toLowerCase();
      const name = (row.student ?? "").toLowerCase();
      return id.includes(q) || name.includes(q);
    });
  }, [attendance, query]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Fall 2026 Semester"
        title="Student Attendance Overview"
        description="See every student's per-class attendance at a glance — who showed up and who was absent."
      >
        <div className="relative w-full sm:w-[280px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by student ID or name"
            className="pl-9"
          />
        </div>
      </PageHeader>
      <AttendanceSummary attendance={filtered} />
      <MonthlyAttendanceReport attendance={filtered} courses={courses} />
      <AttendanceByStudent attendance={filtered} courses={courses} />
    </div>
  );
}