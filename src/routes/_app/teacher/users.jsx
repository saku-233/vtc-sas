import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { listUsers } from "@/lib/server-fns";
import PageHeader from "@/components/PageHeader";
import UserManagement from "@/components/teacher/UserManagement";
import { teacherOnly } from "@/lib/routeGuards";

export const Route = createFileRoute("/_app/teacher/users")({
  head: () => ({ meta: [{ title: "用户管理 · VTC-SAS" }] }),
  beforeLoad: teacherOnly,
  loader: () => listUsers(),
  component: UsersPage,
});

function UsersPage() {
  const users = Route.useLoaderData();
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Super Admin"
        title="用户管理"
        description="超级管理员可查看全体账户、邀请新用户并按角色分配权限。"
      >
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary">
          <Users className="h-3.5 w-3.5" />
          超级管理员
        </span>
      </PageHeader>
      <UserManagement users={users} />
    </div>
  );
}