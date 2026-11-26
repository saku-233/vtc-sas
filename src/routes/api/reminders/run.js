import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/reminders/run")({
  server: {
    handlers: {
      POST: () => Response.json({ ok: false, message: "Use the local FastAPI reminder endpoint" }, { status: 501 }),
      GET: () => Response.json({ ok: false, message: "Use the local FastAPI reminder endpoint" }, { status: 501 }),
    },
  },
});