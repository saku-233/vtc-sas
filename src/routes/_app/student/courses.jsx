import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/PageHeader";
import CourseCard from "@/components/courses/CourseCard";
import CalendarSync from "@/components/courses/CalendarSync";
import { listCourses } from "@/lib/server-fns";
import { studentOnly } from "@/lib/routeGuards";

export const Route = createFileRoute("/_app/student/courses")({
  head: () => ({ meta: [{ title: "我的课程 · VTC-SAS" }, { name: "description", content: "本学期修读的科目、上课时间与老师。" }] }),
  beforeLoad: studentOnly,
  loader: () => listCourses(),
  component: CoursesPage,
});

function CoursesPage() {
  const courses = Route.useLoaderData();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="2026 秋季学期"
        title="我的课程"
        description="本学期修读的科目、上课时间与授课老师。"
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