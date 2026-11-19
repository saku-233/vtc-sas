import { createFileRoute } from "@tanstack/react-router";

const WEEKDAY_CODE = {
  星期一: "MO",
  星期二: "TU",
  星期三: "WE",
  星期四: "TH",
  星期五: "FR",
  星期六: "SA",
  星期日: "SU",
};

// 学期首次上课日期（2026 年 9 月第一周，按星期映射到 ISO 日期）。
const FIRST_DATE = {
  星期一: "20260907",
  星期二: "20260901",
  星期三: "20260902",
  星期四: "20260903",
  星期五: "20260904",
  星期六: "20260905",
  星期日: "20260906",
};

// 香港时间（UTC+8）转 UTC 的 HHMM，用整数取模避免负数。
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
      GET: async ({ context }) => {
        const base44 = context.getBase44();
        const { items } = await base44.entities.Course.list({ sort: "code" });

        const lines = [
          "BEGIN:VCALENDAR",
          "VERSION:2.0",
          "PRODID:-//VTC-SAS//Timetable//ZH",
          "CALSCALE:GREGORIAN",
          "X-WR-CALNAME:VTC 课程时间表",
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
            `DESCRIPTION:${escapeIcs(`老师: ${c.instructor ?? ""}\n地点: ${c.room ?? ""}`)}`,
            `LOCATION:${escapeIcs(c.room ?? "")}`,
            `DTSTART:${date}T${hkToUtcHHMM(c.startTime)}00Z`,
            `DTEND:${date}T${hkToUtcHHMM(c.endTime)}00Z`,
            `RRULE:FREQ=WEEKLY;BYDAY=${day};UNTIL=20270101T000000Z`,
            "BEGIN:VALARM",
            "TRIGGER:-PT15M",
            "ACTION:DISPLAY",
            "DESCRIPTION:15 分钟后上课",
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