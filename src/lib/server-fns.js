import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";

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
  .handler(({ data, context }) => context.getBase44().entities.Assignment.create(data));

export const bulkCreateAssignments = createServerFn({ method: "POST" })
  .validator(z.object({ items: z.array(AssignmentInput).min(1).max(200) }))
  .handler(({ data, context }) => context.getBase44().entities.Assignment.bulkCreate(data.items));

export const updateAssignment = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string(), ...AssignmentInput.shape }))
  .handler(({ data: { id, ...patch }, context }) => context.getBase44().entities.Assignment.update(id, patch));

export const bulkUpdateAssignments = createServerFn({ method: "POST" })
  .validator(z.object({ items: z.array(z.object({ id: z.string(), ...AssignmentInput.shape })).min(1).max(500) }))
  .handler(({ data, context }) => context.getBase44().entities.Assignment.bulkUpdate(data.items));

export const deleteAssignment = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string() }))
  .handler(({ data, context }) => context.getBase44().entities.Assignment.delete(data.id));

export const bulkDeleteAssignments = createServerFn({ method: "POST" })
  .validator(z.object({ ids: z.array(z.string()).min(1).max(500) }))
  .handler(({ data, context }) => context.getBase44().entities.Assignment.deleteMany({ id: { $in: data.ids } }));

export const listUsers = createServerFn({ method: "GET" }).handler(async ({ context }) => {
  const base44 = context.getBase44();
  const users = await base44.entities.User.list("-created_date", 200);
  return users;
});

export const inviteAppUser = createServerFn({ method: "POST" })
  .validator(z.object({ email: z.string().email(), role: z.enum(["admin", "user"]) }))
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();
    await base44.users.inviteUser(data.email, data.role);
    return { success: true };
  });

export const listReminders = createServerFn({ method: "GET" }).handler(async ({ context }) => {
  const base44 = context.getBase44();
  const { items } = await base44.entities.Reminder.list({ sort: "-created_date", limit: 100 });
  return items;
});

function buildContext(courses, assignments, attendance) {
  const courseLines = courses.map((c) => `- ${c.name} (${c.code}) ${c.scheduleDay ?? ""} ${c.startTime ?? ""}-${c.endTime ?? ""} Instructor:${c.instructor ?? ""} Room:${c.room ?? ""}`).join("\n");
  const assignLines = assignments.map((a) => `- ${a.title} (${a.courseCode}) Due:${a.due ?? ""} Status:${a.status ?? ""} Weight:${a.weight ?? ""}%`).join("\n");
  const total = attendance.length;
  const present = attendance.filter((a) => a.status === "Present").length;
  const rate = total ? Math.round((present / total) * 100) : 0;
  return [
    "[Courses]",
    courseLines || "(none)",
    "[Assignments]",
    assignLines || "(none)",
    `[Attendance] ${total} sessions, ${present} present, attendance rate ${rate}%`,
  ].join("\n");
}

export const promoteToTeacher = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    const base44 = context.getBase44();
    await base44.asServiceRole.entities.User.update(context.user.id, { role: "admin" });
    return { success: true };
  });

export const generateQuizQuestions = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    const base44 = context.getBase44();
    const prompt =
      "You are the examiner for VTC IT114115 \"Cloud Computing and Security Fundamentals\". Generate 10 single-choice questions in English covering the course's core content (IaaS/PaaS/SaaS service models, deployment models, virtualization, containers, multi-tenancy, elasticity, on-demand self-service, broad network access, measured service, data security and backup, etc.). Each question has 4 options; mark the correct answer index (0-3). Questions should be accurate, course-relevant, non-repetitive, and moderately difficult.";
    const res = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      model: "gemini_3_8_flash",
      response_json_schema: {
        type: "object",
        properties: {
          questions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                subject: { type: "string" },
                question: { type: "string" },
                options: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 4 },
                answer: { type: "integer", minimum: 0, maximum: 3 },
              },
              required: ["subject", "question", "options", "answer"],
            },
          },
        },
        required: ["questions"],
      },
    });
    const list = Array.isArray(res?.questions) ? res.questions : [];
    return list
      .filter((q) => q?.question && Array.isArray(q.options) && q.options.length === 4 && Number.isInteger(q.answer))
      .slice(0, 10);
  });

export const askGemini = createServerFn({ method: "POST" })
  .validator(z.object({ question: z.string().min(1).max(500) }))
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();
    const [courses, assignments, attendance] = await Promise.all([
      base44.entities.Course.list({ sort: "code" }),
      base44.entities.Assignment.list({ sort: "due" }),
      base44.entities.Attendance.list({ sort: "-date" }),
    ]);
    const ctx = buildContext(courses.items, assignments.items, attendance.items);
    const prompt = `You are the VTC-SAS student study assistant. Answer the student's question concisely and usefully in English, based on the student data below. If the data has no relevant information, say so honestly.\n\n${ctx}\n\nStudent question: ${data.question}`;
    const res = await base44.asServiceRole.integrations.Core.InvokeLLM({ prompt, model: "gemini_3_8_flash" });
    return typeof res === "string" ? res : res?.text ?? "Sorry, I couldn't generate an answer right now.";
  });