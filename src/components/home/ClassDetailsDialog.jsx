import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Award, Clock, MapPin, User, Users } from "lucide-react";

function Detail({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/40 p-3">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <p className="mt-1 font-medium text-foreground">{value}</p>
    </div>
  );
}

export default function ClassDetailsDialog({ course, onClose }) {
  return (
    <Dialog open={!!course} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        {course ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: course.color ?? "#94A3B8" }} />
                {course.name}
              </DialogTitle>
              <DialogDescription>{course.code} · 班级详情</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-1 text-sm">
              <Detail icon={Users} label="学生人数" value={`${course.students ?? 0} 人`} />
              <Detail icon={User} label="授课老师" value={course.instructor || "—"} />
              <Detail
                icon={Clock}
                label="上课时间"
                value={`${course.scheduleDay ?? ""} ${course.startTime ?? ""}–${course.endTime ?? ""}`}
              />
              <Detail icon={MapPin} label="教室" value={course.room || "—"} />
              <Detail icon={Award} label="学分" value={course.credits != null ? `${course.credits}` : "—"} />
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}