import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/PageHeader";
import RemindersPanel from "@/components/reminders/RemindersPanel";
import { listCourses, listReminders } from "@/lib/server-fns";
import { studentOnly } from "@/lib/routeGuards";

export const Route = createFileRoute("/_app/student/reminders")({
  head: () => ({
    meta: [
      { title: "Assignment Reminders · VTC-SAS" },
      { name: "description", content: "Automatic reminders before assignment deadlines." },
    ],
  }),
  loader: async () => {
    const [courses, reminders] = await Promise.all([listCourses(), listReminders()]);
    return { courses, reminders };
  },
  beforeLoad: studentOnly,
  component: RemindersPage,
});

function RemindersPage() {
  const { courses, reminders } = Route.useLoaderData();
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Automatic reminders"
        title="Assignment Reminders"
        description="The system auto-creates reminders one day and two hours before each deadline, so you never miss the final submission."
      />
      <RemindersPanel reminders={reminders} courses={courses} />
    </div>
  );
}