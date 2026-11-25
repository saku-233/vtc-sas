import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/PageHeader";
import RemindersPanel from "@/components/reminders/RemindersPanel";
import { listCourses, listReminders } from "@/lib/server-fns";
import { studentOnly } from "@/lib/routeGuards";

export const Route = createFileRoute("/_app/reminders")({
  head: () => ({
    meta: [
      { title: "作业提醒 · VTC-SAS" },
      { name: "description", content: "作业截止前的自动提醒记录。" },
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
        eyebrow="自动提醒"
        title="作业提醒"
        description="系统在截止前一天及两小时自动生成提醒，帮你把握最终提交期限。"
      />
      <RemindersPanel reminders={reminders} courses={courses} />
    </div>
  );
}