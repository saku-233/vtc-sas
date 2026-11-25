import { createFileRoute, redirect } from "@tanstack/react-router";

// 用户管理已拆为独立入口 /admin，此路由自动跳转过去。
export const Route = createFileRoute("/_app/teacher/users")({
  beforeLoad: () => {
    throw redirect({ to: "/admin" });
  },
  component: () => null,
});