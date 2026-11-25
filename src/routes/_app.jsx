import { createFileRoute, Outlet } from "@tanstack/react-router";
import AppNav from "@/components/AppNav";
import { authQuery } from "@/lib/AuthContext";
import { useViewAs } from "@/lib/ViewAsContext";

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
  const { viewAs } = useViewAs();
  // 以某用户身份查看时，按该用户的角色应用主题。
  const effectiveRole = viewAs?.role ?? user?.role;
  const isTeacher = effectiveRole === "admin";
  return (
    <div className={`min-h-screen bg-background ${isTeacher ? "theme-teacher" : ""}`}>
      <AppNav />
      <main className="mx-auto max-w-6xl px-5 pb-24 pt-10 sm:px-8 sm:pt-14">
        <Outlet />
      </main>
    </div>
  );
}