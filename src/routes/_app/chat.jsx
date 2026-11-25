import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/PageHeader";
import ChatWindow from "@/components/chat/ChatWindow";
import { listAssignments, listAttendance, listCourses } from "@/lib/server-fns";

export const Route = createFileRoute("/_app/chat")({
  head: () => ({ meta: [{ title: "Chatbot · VTC-SAS" }, { name: "description", content: "用对话查询作业、课程与出席。" }] }),
  ssr: false,
  loader: async () => {
    const [courses, assignments, attendance] = await Promise.all([
      listCourses(),
      listAssignments(),
      listAttendance(),
    ]);
    return { courses, assignments, attendance };
  },
  component: ChatPage,
});

function ChatPage() {
  const { courses, assignments, attendance } = Route.useLoaderData();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="学习助手"
        title="Chatbot"
        description="用对话查询作业、课程与出席。可切换 Gemini 云端 AI 或本地AI 两种引擎。"
      />
      <ChatWindow courses={courses} assignments={assignments} attendance={attendance} />
    </div>
  );
}