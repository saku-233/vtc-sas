import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/PageHeader";
import ChatWindow from "@/components/chat/ChatWindow";
import { listAssignments, listAttendance, listCourses } from "@/lib/server-fns";
import { teacherOnly } from "@/lib/routeGuards";

export const Route = createFileRoute("/_app/teacher/chat")({
  head: () => ({ meta: [{ title: "Chatbot · VTC-SAS" }, { name: "description", content: "Ask about course, assignment and attendance data in conversation." }] }),
  ssr: false,
  beforeLoad: teacherOnly,
  loader: async () => {
    const [courses, assignments, attendance] = await Promise.all([
      listCourses(),
      listAssignments(),
      listAttendance(),
    ]);
    return { courses, assignments, attendance };
  },
  component: TeacherChatPage,
});

function TeacherChatPage() {
  const { courses, assignments, attendance } = Route.useLoaderData();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Study Assistant"
        title="Chatbot"
        description="Ask about course, assignment and attendance data. Switch between the Gemini cloud AI and the Local AI engine."
      />
      <ChatWindow courses={courses} assignments={assignments} attendance={attendance} />
    </div>
  );
}