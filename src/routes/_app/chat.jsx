import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/PageHeader";
import SectionPending from "@/components/SectionPending";

export const Route = createFileRoute("/_app/chat")({
  head: () => ({ meta: [{ title: "Chatbot · VTC-SAS" }] }),
  component: ChatPage,
});

function ChatPage() {
  return (
    <div className="space-y-8">
      <PageHeader eyebrow="学习助手" title="Chatbot" description="用对话查询作业、课程与截止日期。" />
      <SectionPending title="学习助手正在准备" description="这里会用对话回答你的学业问题，并直接带你去相关的作业或课程。" />
    </div>
  );
}