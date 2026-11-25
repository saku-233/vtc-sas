import { redirect } from "@tanstack/react-router";

// 学生页面：仅学生（role=user）可访问。未登录跳登录页，教师（admin）挡回教师首页。
export function studentOnly({ context }) {
  if (!context.user) throw redirect({ to: "/login" });
  if (context.user.role !== "user") throw redirect({ to: "/teacher" });
}

// 教师页面：仅教师（admin）可访问。未登录跳登录页，学生挡回学生仪表板。
export function teacherOnly({ context }) {
  if (!context.user) throw redirect({ to: "/login" });
  if (context.user.role !== "admin") throw redirect({ to: "/student/dashboard" });
}