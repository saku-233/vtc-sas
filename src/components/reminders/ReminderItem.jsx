import { Bell, Clock } from "lucide-react";

const LEAD_STYLES = {
  "1天前": "border-yellow-200 bg-yellow-100 text-yellow-800",
  "2小时前": "border-red-200 bg-red-100 text-red-800",
};

function formatDue(due) {
  const d = new Date(due);
  if (!Number.isFinite(d.getTime())) return due ?? "—";
  return d.toLocaleString("zh-HK", {
    timeZone: "Asia/Hong_Kong",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ReminderItem({ reminder, courseName }) {
  const lead = reminder.leadTime;
  const style = LEAD_STYLES[lead] ?? "border-border bg-secondary text-foreground";
  return (
    <li className="flex items-start gap-3 rounded-xl border border-border/60 bg-background/40 p-3">
      <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
        <Bell className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-medium text-foreground">{reminder.title}</p>
          <span className={`rounded-full border px-2 py-0.5 text-[11px] ${style}`}>{lead}</span>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {courseName ?? reminder.courseCode} · {reminder.courseCode}
        </p>
        <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
          <Clock className="h-3 w-3" /> 截止 {formatDue(reminder.due)}
        </p>
      </div>
    </li>
  );
}