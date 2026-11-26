const DONE_STATUSES = ["Submitted", "Graded"];
const HOUR = 3600000;

function formatDue(due) {
  const d = new Date(due);
  if (!Number.isFinite(d.getTime())) return due ?? "—";
  return d.toLocaleString("en-GB", {
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
  const subject = `Assignment reminder · ${assignment.title} (due ${leadTime})`;
  const body = `Hello,

This is an automatic assignment reminder from VTC-SAS:

  Assignment: ${assignment.title}
  Course: ${courseName} (${assignment.courseCode})
  Due: ${formatDue(assignment.due)}
  Reminder: due ${leadTime}

Please head to VTC-SAS to submit before the deadline.
Open assignments: ${origin}/assignments

— VTC-SAS automatic reminder`;
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
      { leadTime: "1 day before", key: `${a.id}-1d`, min: 2, max: 24 },
      { leadTime: "2 hours before", key: `${a.id}-2h`, min: 0, max: 2 },
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