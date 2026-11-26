import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/PageHeader";
import { listAssignments, listCourses } from "@/lib/server-fns";
import { teacherOnly } from "@/lib/routeGuards";
import BatchAssignmentManager from "@/components/teacher/BatchAssignmentManager";

export const Route = createFileRoute("/_app/teacher/assignments")({
  head: () => ({ meta: [{ title: "Assignment Management · VTC-SAS" }, { name: "description", content: "Batch edit, publish and delete assignments across classes." }] }),
  beforeLoad: teacherOnly,
  loader: async () => {
    const [courses, assignments] = await Promise.all([listCourses(), listAssignments()]);
    return { courses, assignments };
  },
  component: TeacherAssignmentsPage,
});

function TeacherAssignmentsPage() {
  const { courses, assignments } = Route.useLoaderData();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Fall 2026 Semester"
        title="Assignment Management"
        description="Batch edit assignments across classes, set due dates and statuses in bulk, and publish or delete in one click."
      />
      <BatchAssignmentManager assignments={assignments} courses={courses} />
    </div>
  );
}