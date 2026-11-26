import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/PageHeader";
import CourseCard from "@/components/courses/CourseCard";
import CalendarSync from "@/components/courses/CalendarSync";
import { listCourses } from "@/lib/server-fns";
import { teacherOnly } from "@/lib/routeGuards";

export const Route = createFileRoute("/_app/teacher/courses")({
  head: () => ({ meta: [{ title: "My Courses · VTC-SAS" }, { name: "description", content: "The subjects, class times and rooms you teach this semester." }] }),
  beforeLoad: teacherOnly,
  loader: () => listCourses(),
  component: TeacherCoursesPage,
});

function TeacherCoursesPage() {
  const courses = Route.useLoaderData();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Fall 2026 Semester"
        title="My Courses"
        description="The subjects, class times and rooms you teach this semester."
      />
      {courses.length === 0 ? (
        <p className="text-sm text-muted-foreground">No course information yet.</p>
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