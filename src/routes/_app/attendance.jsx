import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/PageHeader";
import SectionPending from "@/components/SectionPending";

export const Route = createFileRoute("/_app/attendance")({
  head: () => ({ meta: [{ title: "出席 · VTC-SAS" }] }),
  component: AttendancePage,
});

function AttendancePage() {
  return (
    <div className="space-y-8">
      <PageHeader eyebrow="2026 秋季学期" title="出席" description="每节课的出席记录与整体出席率。" />
      <SectionPending title="出席页正在准备" description="这里会按科目显示出席记录、缺席次数与出席率。" />
    </div>
  );
}