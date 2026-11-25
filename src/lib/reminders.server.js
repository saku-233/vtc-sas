const DONE_STATUSES = ["已提交", "已评分"];
const HOUR = 3600000;

function formatDue(due) {
  const d = new Date(due);
  if (!Number.isFinite(d.getTime())) return due ?? "—";
  return d.toLocaleString("zh-HK", {
    timeZone: "Asia/Hong_Kong",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function sendReminderEmail(svc, to, assignment, course, leadTime, origin) {
  const courseName = course?.name ?? assignment.courseCode;
  const subject = `作业提醒 · ${assignment.title}（截止${leadTime}）`;
  const body = `你好，

这是来自 VTC-SAS 的自动作业提醒：

  作业：${assignment.title}
  课程：${courseName}（${assignment.courseCode}）
  截止时间：${formatDue(assignment.due)}
  提醒时间：截止${leadTime}

请尽快前往 VTC-SAS 完成提交，避免错过最终期限。
打开作业页面：${origin}/assignments

—— VTC-SAS 自动提醒`;
  await svc.integrations.Core.SendEmail({ to, subject, body });
}

/**
 * Checks open assignments and creates in-app reminders + sends emails
 * at 1-day and 2-hour lead times. Idempotent via the `key` field.
 *
 * @param {object} svc - base44 client in service role (context.getBase44().asServiceRole)
 * @param {{ origin: string, recipient: string|null }} opts
 */
export async function runReminderCheck(svc, { origin, recipient }) {
  const { items: assignments } = await svc.entities.Assignment.list({ sort: "due", limit: 200 });
  const { items: courses } = await svc.entities.Course.list({ sort: "code" });
  const courseByCode = Object.fromEntries(courses.map((c) => [c.code, c]));
  const now = Date.now();

  const results = { checked: 0, sent: 0, emails: 0, skipped: 0 };

  for (const a of assignments) {
    if (DONE_STATUSES.includes(a.status)) continue;
    const dueMs = new Date(a.due).getTime();
    if (!Number.isFinite(dueMs)) continue;
    const hoursLeft = (dueMs - now) / HOUR;
    results.checked++;

    const windows = [
      { leadTime: "1天前", key: `${a.id}-1d`, min: 2, max: 24 },
      { leadTime: "2小时前", key: `${a.id}-2h`, min: 0, max: 2 },
    ];

    for (const w of windows) {
      if (hoursLeft <= w.min || hoursLeft > w.max) continue;
      const { items: existing } = await svc.entities.Reminder.filter({ key: w.key });
      if (existing.length > 0) {
        results.skipped++;
        continue;
      }
      const course = courseByCode[a.courseCode];
      await svc.entities.Reminder.create({
        key: w.key,
        assignmentId: a.id,
        courseCode: a.courseCode,
        title: a.title,
        due: a.due,
        leadTime: w.leadTime,
      });
      results.sent++;
      if (recipient) {
        try {
          await sendReminderEmail(svc, recipient, a, course, w.leadTime, origin);
          results.emails++;
        } catch {
          // email failure should not block the in-app reminder
        }
      }
    }
  }

  return results;
}