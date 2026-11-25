import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/PageHeader";
import RemindersPanel from "@/components/reminders/RemindersPanel";
import { listCourses, listReminders } from "@/lib/server-fns";
import { teacherOnly } from "@/lib/routeGuards";

export const Route = createFileRoute("/_app/teacher/reminders")({
  head: () => ({ meta: [{ title: "作业提醒 · VTC-SAS" }, { name: "description", content: "系统自动生成的作业截止提醒记录。" }] }),
  beforeLoad: teacherOnly,
  loader: async () => {
    const [courses, reminders] = await Promise.all([listCourses(), listReminders()]);
    return { courses, reminders };
  },
  component: TeacherRemindersPage,
});

function TeacherRemindersPage() {
  const { courses, reminders } = Route.useLoaderData();
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="自动提醒"
        title="作业提醒"
        description="系统在截止前一天及两小时自动生成提醒，帮助学生把握最终提交期限。"
      />
      <RemindersPanel reminders={reminders} courses={courses} />
    </div>
  );
}