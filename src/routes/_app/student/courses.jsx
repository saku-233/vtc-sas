import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/PageHeader";
import CourseCard from "@/components/courses/CourseCard";
import { listCourses } from "@/lib/server-fns";
import { studentOnly } from "@/lib/routeGuards";

export const Route = createFileRoute("/_app/student/courses")({
  head: () => ({ meta: [{ title: "My Courses · VTC-SAS" }, { name: "description", content: "This semester's subjects, class times and instructors." }] }),
  beforeLoad: studentOnly,
  loader: () => listCourses(),
  component: CoursesPage,
});

function CoursesPage() {
  const courses = Route.useLoaderData();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Fall 2026 Semester"
        title="My Courses"
        description="The subjects, class times and instructors for this semester."
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
    </div>
  );
}