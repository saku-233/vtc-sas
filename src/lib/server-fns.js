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
  status: z.enum(["未开始", "进行中", "已提交", "已评分"]).optional(),
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
  const courseLines = courses.map((c) => `- ${c.name}（${c.code}）${c.scheduleDay ?? ""} ${c.startTime ?? ""}-${c.endTime ?? ""} 教师:${c.instructor ?? ""} 课室:${c.room ?? ""}`).join("\n");
  const assignLines = assignments.map((a) => `- ${a.title}（${a.courseCode}）截止:${a.due ?? ""} 状态:${a.status ?? ""} 占比:${a.weight ?? ""}%`).join("\n");
  const total = attendance.length;
  const present = attendance.filter((a) => a.status === "出席").length;
  const rate = total ? Math.round((present / total) * 100) : 0;
  return [
    "【课程】",
    courseLines || "（暂无）",
    "【作业】",
    assignLines || "（暂无）",
    `【出席】共 ${total} 节，出席 ${present} 节，出席率 ${rate}%`,
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
      "你是 VTC IT114115《云端运算及安全基础》课程出题官。请围绕该课程核心内容（云计算服务模式 IaaS/PaaS/SaaS、部署模型、虚拟化、容器、多租户、弹性、按需自助、广域访问、可度量服务、数据安全与备份等）生成 10 道中文单选题，每题 4 个选项，并标注正确答案索引(0-3)。题目需准确、贴近课程、避免重复，难度适中。";
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
    const prompt = `你是 VTC-SAS 学生学习助手。根据下面的学生数据用简体中文回答问题，回答要简洁实用。如果数据中没有相关信息就如实说明。\n\n${ctx}\n\n学生问题：${data.question}`;
    const res = await base44.asServiceRole.integrations.Core.InvokeLLM({ prompt, model: "gemini_3_8_flash" });
    return typeof res === "string" ? res : res?.text ?? "抱歉，暂时无法生成回答。";
  });