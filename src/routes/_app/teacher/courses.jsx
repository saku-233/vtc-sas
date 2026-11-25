import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/PageHeader";
import CourseCard from "@/components/courses/CourseCard";
import CalendarSync from "@/components/courses/CalendarSync";
import { listCourses } from "@/lib/server-fns";
import { teacherOnly } from "@/lib/routeGuards";

export const Route = createFileRoute("/_app/teacher/courses")({
  head: () => ({ meta: [{ title: "我教授的课程 · VTC-SAS" }, { name: "description", content: "本学期授课科目、上课时间与课室。" }] }),
  beforeLoad: teacherOnly,
  loader: () => listCourses(),
  component: TeacherCoursesPage,
});

function TeacherCoursesPage() {
  const courses = Route.useLoaderData();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="2026 秋季学期"
        title="我教授的课程"
        description="本学期授课科目、上课时间与课室。"
      />
      {courses.length === 0 ? (
        <p className="text-sm text-muted-foreground">还没有课程资料。</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
      <CalendarSync />
    </div>
  );
}