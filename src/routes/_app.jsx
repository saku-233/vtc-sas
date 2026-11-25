import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import AppNav from "@/components/AppNav";
import { authQuery } from "@/lib/AuthContext";

export const Route = createFileRoute("/_app")({
  ssr: false,
  beforeLoad: async ({ context }) => {
    // 解析当前访客身份并注入路由 context，子路由可用 context.user 做角色分流。
    const { user } = await context.queryClient.ensureQueryData(authQuery);
    return { user };
  },
  component: AppLayout,
});

function AppLayout() {
  const { user } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  // 主题按当前页面区域决定，与学生/教师导航保持一致。
  const isStudentArea = pathname.startsWith("/student");
  const isTeacherArea = pathname.startsWith("/teacher");
  const isTeacher = isTeacherArea || (!isStudentArea && user?.role === "admin");
  const isLanding = pathname === "/";
  return (
    <div className={`min-h-screen bg-background ${isTeacher ? "theme-teacher" : ""}`}>
      {!isLanding ? <AppNav /> : null}
      <main className="mx-auto max-w-6xl px-5 pb-24 pt-10 sm:px-8 sm:pt-14">
        <Outlet />
      </main>
    </div>
  );
}