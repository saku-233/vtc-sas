import { createFileRoute } from "@tanstack/react-router";
import { localApi } from "@/api/localClient";

const WEEKDAY_CODE = {
  Monday: "MO",
  Tuesday: "TU",
  Wednesday: "WE",
  Thursday: "TH",
  Friday: "FR",
  Saturday: "SA",
  Sunday: "SU",
};

// First class date of the semester (first week of September 2026, mapped by weekday to an ISO date).
const FIRST_DATE = {
  Monday: "20260907",
  Tuesday: "20260901",
  Wednesday: "20260902",
  Thursday: "20260903",
  Friday: "20260904",
  Saturday: "20260905",
  Sunday: "20260906",
};

// Hong Kong time (UTC+8) to UTC HHMM, using integer modulo to avoid negatives.
function hkToUtcHHMM(hk) {
  const [h, m] = hk.split(":").map(Number);
  const u = ((h - 8) % 24 + 24) % 24;
  return `${String(u).padStart(2, "0")}${String(m).padStart(2, "0")}`;
}

function escapeIcs(text) {
  return String(text ?? "").replace(/[\\,;\n]/g, (c) => (c === "\n" ? "\\n" : "\\" + c));
}

export const Route = createFileRoute("/api/timetable")({
  server: {
    handlers: {
      GET: async () => {
        const items = await localApi.courses.list();

        const lines = [
          "BEGIN:VCALENDAR",
          "VERSION:2.0",
          "PRODID:-//VTC-SAS//Timetable//EN",
          "CALSCALE:GREGORIAN",
          "X-WR-CALNAME:VTC Course Timetable",
          "X-WR-TIMEZONE:Asia/Hong_Kong",
        ];

        for (const c of items) {
          if (!c.scheduleDay || !c.startTime || !c.endTime) continue;
          const day = WEEKDAY_CODE[c.scheduleDay];
          const date = FIRST_DATE[c.scheduleDay];
          if (!day || !date) continue;

          lines.push(
            "BEGIN:VEVENT",
            `UID:course-${c.code}@vtc-sas`,
            `SUMMARY:${escapeIcs(`${c.name} (${c.code})`)}`,
            `DESCRIPTION:${escapeIcs(`Instructor: ${c.instructor ?? ""}\nRoom: ${c.room ?? ""}`)}`,
            `LOCATION:${escapeIcs(c.room ?? "")}`,
            `DTSTART:${date}T${hkToUtcHHMM(c.startTime)}00Z`,
            `DTEND:${date}T${hkToUtcHHMM(c.endTime)}00Z`,
            `RRULE:FREQ=WEEKLY;BYDAY=${day};UNTIL=20270101T000000Z`,
            "BEGIN:VALARM",
            "TRIGGER:-PT15M",
            "ACTION:DISPLAY",
            "DESCRIPTION:Class starts in 15 minutes",
            "END:VALARM",
            "END:VEVENT"
          );
        }

        lines.push("END:VCALENDAR");
        const body = lines.join("\r\n");

        return new Response(body, {
          headers: {
            "Content-Type": "text/calendar; charset=utf-8",
            "Content-Disposition": 'attachment; filename="vtc-timetable.ics"',
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
});