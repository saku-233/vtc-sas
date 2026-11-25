import { createServerFn } from "@tanstack/react-start";

export const listCourses = createServerFn({ method: "GET" }).handler(async ({ context }) => {
  const base44 = context.getBase44();
  const { items } = await base44.entities.Course.list({ sort: "code" });
  return items;
});

export const listAssignments = createServerFn({ method: "GET" }).handler(async ({ context }) => {
  const base44 = context.getBase44();
  const { items } = await base44.entities.Assignment.list({ sort: "due" });
  return items;
});

export const listAttendance = createServerFn({ method: "GET" }).handler(async ({ context }) => {
  const base44 = context.getBase44();
  const { items } = await base44.entities.Attendance.list({ sort: "-date" });
  return items;
});

export const listReminders = createServerFn({ method: "GET" }).handler(async ({ context }) => {
  const base44 = context.getBase44();
  const { items } = await base44.entities.Reminder.list({ sort: "-created_date", limit: 100 });
  return items;
});