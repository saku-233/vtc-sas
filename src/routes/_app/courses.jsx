import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/PageHeader";
import SectionPending from "@/components/SectionPending";

export const Route = createFileRoute("/_app/courses")({
  head: () => ({ meta: [{ title: "我的课程 · VTC-SAS" }] }),
  component: CoursesPage,
});

function CoursesPage() {
  return (
    <div className="space-y-8">
      <PageHeader eyebrow="2026 秋季学期" title="我的课程" description="本学期的科目、课时与授课老师。" />
      <SectionPending title="课程页正在准备" description="这里会列出你修读的科目、上课时间与老师资料。" />
    </div>
  );
}