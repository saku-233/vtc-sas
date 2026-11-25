import { createFileRoute } from "@tanstack/react-router";
import { secrets } from "base44:runtime";
import { runReminderCheck } from "@/lib/reminders.server";

async function handle({ request, context }) {
  const svc = context.getBase44().asServiceRole;
  const origin = new URL(request.url).origin;
  const recipient = (await secrets.get("REMINDER_EMAIL")) || null;
  const result = await runReminderCheck(svc, { origin, recipient });
  return Response.json({ ok: true, ...result });
}

export const Route = createFileRoute("/api/reminders/run")({
  server: {
    handlers: {
      POST: handle,
      GET: handle,
    },
  },
});