import { Info, Phone, CalendarDays, Newspaper } from "lucide-react";

const INFO_ITEMS = [
  {
    icon: Info,
    label: "关于本校",
    title: "VTC 职业训练局",
    text: "培育专业人才，提供高质量职业教育课程，连结学术与实务。",
  },
  {
    icon: Phone,
    label: "联络资讯",
    title: "校务处",
    text: "电话：+852 3700 7000 · 电邮：enquiry@vtc.edu.hk",
  },
  {
    icon: CalendarDays,
    label: "活动",
    title: "校园活动",
    text: "学期开放日、行业讲座及技能工作坊，随时查看最新日程。",
  },
  {
    icon: Newspaper,
    label: "新闻",
    title: "最新公告",
    text: "课程更新、奖学金消息与学界竞赛资讯一手掌握。",
  },
];

export default function SchoolInfoBar() {
  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {INFO_ITEMS.map((item) => (
        <div
          key={item.label}
          className="flex flex-col gap-2 rounded-2xl border border-border/80 bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_18px_40px_-30px_rgba(20,40,35,0.45)]"
        >
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
              <item.icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
            </span>
            <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {item.label}
            </span>
          </div>
          <h3 className="font-heading text-[15px] text-foreground">{item.title}</h3>
          <p className="text-[13px] leading-relaxed text-muted-foreground">{item.text}</p>
        </div>
      ))}
    </section>
  );
}