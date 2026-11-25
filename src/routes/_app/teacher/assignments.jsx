import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/PageHeader";
import { listAssignments, listCourses } from "@/lib/server-fns";
import { teacherOnly } from "@/lib/routeGuards";
import BatchAssignmentManager from "@/components/teacher/BatchAssignmentManager";

export const Route = createFileRoute("/_app/teacher/assignments")({
  head: () => ({ meta: [{ title: "作业管理 · VTC-SAS" }, { name: "description", content: "批量编辑、发布与删除多个班级的作业。" }] }),
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
        eyebrow="2026 秋季学期"
        title="作业管理"
        description="批量编辑多个班级的作业、统一设置截止日期与状态，一键发布或删除。"
      />
      <BatchAssignmentManager assignments={assignments} courses={courses} />
    </div>
  );
}