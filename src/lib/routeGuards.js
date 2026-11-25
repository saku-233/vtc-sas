import { redirect } from "@tanstack/react-router";

// 学生页面：教师（admin）访问时跳转到教师后台首页
export function studentOnly({ context }) {
  if (context.user?.role === "admin") throw redirect({ to: "/teacher" });
}

// 教师页面：学生（非 admin）访问时跳转到学生仪表板
export function teacherOnly({ context }) {
  if (context.user?.role !== "admin") throw redirect({ to: "/student/dashboard" });
}