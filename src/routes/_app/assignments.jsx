import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/PageHeader";
import AssignmentStats from "@/components/assignments/AssignmentStats";
import AssignmentFilters from "@/components/assignments/AssignmentFilters";
import AssignmentItem from "@/components/assignments/AssignmentItem";
import { listAssignments, listCourses, listReminders } from "@/lib/server-fns";
import { daysUntil, DONE_STATUSES } from "@/lib/assignments";
import { studentOnly } from "@/lib/routeGuards";
import RemindersPanel from "@/components/reminders/RemindersPanel";

export const Route = createFileRoute("/_app/assignments")({
  head: () => ({
    meta: [
      { title: "我的作业 · VTC-SAS" },
      { name: "description", content: "所有课程的作业、截止日期、占总评比重与提交状态集中在一页。" },
    ],
  }),
  loader: async () => {
    const [courses, assignments, reminders] = await Promise.all([listCourses(), listAssignments(), listReminders()]);
    return { courses, assignments, reminders };
  },
  beforeLoad: studentOnly,
  component: AssignmentsPage,
});

function AssignmentsPage() {
  const { courses, assignments, reminders } = Route.useLoaderData();
  const courseByCode = useMemo(() => Object.fromEntries(courses.map((c) => [c.code, c])), [courses]);

  const [items, setItems] = useState(assignments);
  const [filter, setFilter] = useState("全部");
  const [today, setToday] = useState(null);

  useEffect(() => {
    setToday(new Date());
  }, []);

  const counts = useMemo(() => {
    const base = { 全部: items.length, 未开始: 0, 进行中: 0, 已提交: 0, 已评分: 0 };
    items.forEach((item) => {
      base[item.status] = (base[item.status] ?? 0) + 1;
    });
    return base;
  }, [items]);

  const summary = useMemo(() => {
    const open = items.filter((item) => !DONE_STATUSES.includes(item.status));
    const soon = today
      ? open.filter((item) => {
          const left = daysUntil(item.due, today);
          return left >= 0 && left <= 7;
        })
      : [];
    return {
      open: open.length,
      soon: soon.length,
      submitted: items.length - open.length,
    };
  }, [items, today]);

  const visible = useMemo(() => {
    const list = filter === "全部" ? items : items.filter((item) => item.status === filter);
    return [...list].sort((a, b) => a.due.localeCompare(b.due));
  }, [items, filter]);

  function toggleSubmitted(id) {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        return { ...item, status: DONE_STATUSES.includes(item.status) ? "未开始" : "已提交" };
      })
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="2026 秋季学期"
        title="我的作业"
        description="每项作业的截止日期、占总评比重与提交状态，按到期日排列。"
      />

      <AssignmentStats summary={summary} />

      <RemindersPanel reminders={reminders} courses={courses} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <AssignmentFilters active={filter} counts={counts} onChange={setFilter} />
        <p className="text-xs text-muted-foreground sm:text-right">共 {visible.length} 项</p>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
          <p className="font-heading text-lg text-foreground">这里还没有作业</p>
          <p className="mt-2 text-sm text-muted-foreground">换个筛选条件看看其他状态的作业。</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {visible.map((item) => (
            <AssignmentItem
              key={item.id}
              item={item}
              course={courseByCode[item.courseCode]}
              today={today}
              onToggle={toggleSubmitted}
            />
          ))}
        </ul>
      )}
    </div>
  );
}