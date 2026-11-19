export default function CourseCard({ course }) {
  return (
    <article className="relative overflow-hidden rounded-2xl border border-border/80 bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_44px_-30px_rgba(20,40,35,0.45)]">
      <span className="absolute left-0 top-0 h-full w-1" style={{ backgroundColor: course.color }} />
      <div className="pl-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {course.code}
          </span>
          <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-secondary-foreground">
            {course.credits} 学分
          </span>
        </div>
        <h3 className="mt-1.5 font-heading text-lg leading-snug text-foreground">{course.name}</h3>
        <dl className="mt-3 space-y-1.5 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">老师</dt>
            <dd className="text-foreground/85">{course.instructor}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">时间</dt>
            <dd className="text-foreground/85">
              {course.scheduleDay} {course.startTime}–{course.endTime}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">地点</dt>
            <dd className="text-foreground/85">{course.room}</dd>
          </div>
        </dl>
      </div>
    </article>
  );
}