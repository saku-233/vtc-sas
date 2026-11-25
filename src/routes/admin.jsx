import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { ArrowLeft, LogOut, Shield, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { listUsers } from "@/lib/server-fns";
import UserManagement from "@/components/teacher/UserManagement";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({ meta: [{ title: "超级管理后台 · VTC-SAS" }] }),
  loader: async () => {
    try {
      return { users: await listUsers() };
    } catch {
      return { users: [] };
    }
  },
  component: AdminConsole,
});

function AdminConsole() {
  const { user, isLoadingAuth, logout, navigateToLogin } = useAuth();
  const { users } = Route.useLoaderData();

  if (isLoadingAuth) {
    return (
      <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-6">
        <div className="max-w-sm space-y-4 text-center">
          <Shield className="mx-auto h-10 w-10 text-primary" />
          <h1 className="font-heading text-xl text-foreground">需要登录</h1>
          <p className="text-sm text-muted-foreground">此入口仅限管理员访问，请先登录。</p>
          <button
            onClick={() => navigateToLogin()}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
          >
            前往登录
          </button>
        </div>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-6">
        <div className="max-w-sm space-y-4 text-center">
          <Shield className="mx-auto h-10 w-10 text-destructive" />
          <h1 className="font-heading text-xl text-foreground">权限不足</h1>
          <p className="text-sm text-muted-foreground">此入口仅限管理员（教师）账户访问。</p>
          <Link
            to="/student/dashboard"
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            返回学生端
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen theme-teacher bg-background">
      <header className="sticky top-0 z-40 border-b border-[#e5e7eb] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-[22px] py-[14px]">
          <div className="flex items-center gap-2.5">
            <span className="grid h-[34px] w-[34px] place-items-center rounded-[11px] bg-[#1d4ed8] text-[11px] font-bold tracking-[-0.04em] text-white">
              VS
            </span>
            <div className="leading-tight">
              <strong className="block font-heading text-[15px] font-bold tracking-[0.12em] text-[#1f2937]">
                VTC-SAS
              </strong>
              <span className="text-[11px] text-[#6b7280]">超级管理后台 · 独立入口</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Link
              to="/teacher"
              className="inline-flex items-center gap-1.5 rounded-full border border-[#d9e2df] bg-white px-3 py-2 text-xs text-[#4b5563] transition-colors hover:border-[#9ac7ba] hover:text-[#265e53]"
            >
              <ArrowLeft className="h-[18px] w-[18px]" strokeWidth={1.8} />
              返回主应用
            </Link>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#d9e2df] bg-white px-3 py-2 text-xs text-[#4b5563] transition-colors hover:border-[#9ac7ba] hover:text-[#265e53]"
            >
              <LogOut className="h-[18px] w-[18px]" strokeWidth={1.8} />
              退出
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 pb-24 pt-10 sm:px-8 sm:pt-14">
        <div className="space-y-8">
          <div className="flex flex-col gap-6 border-b border-border/70 pb-8 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-primary/70">Super Admin</p>
              <h1 className="mt-3 font-heading text-[30px] leading-[1.18] tracking-tight text-foreground sm:text-[38px]">
                用户管理
              </h1>
              <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                超级管理员可查看全体账户、邀请新用户并按角色分配权限。此为独立入口，与主应用分开。
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary">
              <Shield className="h-3.5 w-3.5" />
              超级管理员
            </span>
          </div>
          <UserManagement users={users} />
        </div>
      </main>
    </div>
  );
}