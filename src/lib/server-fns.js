import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { localApi } from "@/api/localClient";

export const listCourses = createServerFn({ method: "GET" }).handler(() => localApi.courses.list());
export const listAssignments = createServerFn({ method: "GET" }).handler(() => localApi.assignments.list());
export const listAttendance = createServerFn({ method: "GET" }).handler(() => localApi.attendance.list());
export const listReminders = createServerFn({ method: "GET" }).handler(() => localApi.reminders.list());
export const listUsers = createServerFn({ method: "GET" }).handler(() => localApi.users.list());

const AssignmentInput = z.object({
  courseCode: z.string().min(1),
  title: z.string().min(1).max(120),
  type: z.string().max(40).optional(),
  weight: z.number().min(0).max(100).optional(),
  due: z.string().optional(),
  status: z.enum(["Not Started", "In Progress", "Submitted", "Graded"]).optional(),
  note: z.string().max(500).optional(),
});

export const createAssignment = createServerFn({ method: "POST" })
  .validator(AssignmentInput)
  .handler(({ data }) => localApi.assignments.create(data));

export const bulkCreateAssignments = createServerFn({ method: "POST" })
  .validator(z.object({ items: z.array(AssignmentInput).min(1).max(200) }))
  .handler(({ data }) => localApi.assignments.bulkCreate(data.items));

export const updateAssignment = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string(), ...AssignmentInput.shape }))
  .handler(({ data: { id, ...patch } }) => localApi.assignments.update(id, patch));

export const bulkUpdateAssignments = createServerFn({ method: "POST" })
  .validator(z.object({ items: z.array(z.object({ id: z.string(), ...AssignmentInput.shape })).min(1).max(500) }))
  .handler(({ data }) => localApi.assignments.bulkUpdate(data.items));

export const deleteAssignment = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string() }))
  .handler(({ data }) => localApi.assignments.delete(data.id));

export const bulkDeleteAssignments = createServerFn({ method: "POST" })
  .validator(z.object({ ids: z.array(z.string()).min(1).max(500) }))
  .handler(({ data }) => localApi.assignments.bulkDelete(data.ids));

export const inviteAppUser = createServerFn({ method: "POST" })
  .validator(z.object({ email: z.string().email(), role: z.enum(["admin", "user"]) }))
  .handler(({ data }) => localApi.users.invite(data));

export const promoteToTeacher = createServerFn({ method: "POST" })
  .handler(() => localApi.users.promoteTeacher());

export const generateQuizQuestions = createServerFn({ method: "POST" })
  .handler(() => localApi.ai.generateQuiz());

export const askGemini = createServerFn({ method: "POST" })
  .validator(z.object({ question: z.string().min(1).max(500) }))
  .handler(({ data }) => localApi.ai.chat(data.question));