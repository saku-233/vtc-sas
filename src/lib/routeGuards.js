import { redirect } from "@tanstack/react-router";

// Student pages: only students (role=user) may access. Anonymous visitors are sent to the login page; teachers (admin) are redirected to the teacher home.
export function studentOnly({ context }) {
  if (!context.user) throw redirect({ to: "/login" });
  if (context.user.role !== "user") throw redirect({ to: "/teacher" });
}

// Teacher pages: only teachers (admin) may access. Anonymous visitors are sent to the login page; students are redirected to the student dashboard.
export function teacherOnly({ context }) {
  if (!context.user) throw redirect({ to: "/login" });
  if (context.user.role !== "admin") throw redirect({ to: "/student/dashboard" });
}