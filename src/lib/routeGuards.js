import { redirect } from "@tanstack/react-router";

// 学生页面：必须登录。管理员（root）可自由访问查看学生视角，其余学生正常进入。
export function studentOnly({ context }) {
  if (!context.user) throw redirect({ to: "/login" });
  if (context.user.role === "admin") return;
}

// 教师页面：必须登录。学生（非 admin）访问时跳转到学生仪表板
export function teacherOnly({ context }) {
  if (!context.user) throw redirect({ to: "/login" });
  if (context.user.role !== "admin") throw redirect({ to: "/student/dashboard" });
}