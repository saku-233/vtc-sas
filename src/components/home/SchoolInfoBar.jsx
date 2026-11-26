import { Info, Phone, CalendarDays, Newspaper } from "lucide-react";

const INFO_ITEMS = [
  {
    icon: Info,
    label: "About",
    title: "Vocational Training Council",
    text: "Nurturing professionals with high-quality vocational education that bridges study and practice.",
  },
  {
    icon: Phone,
    label: "Contact",
    title: "Academic Office",
    text: "Tel: +852 3700 7000 · Email: enquiry@vtc.edu.hk",
  },
  {
    icon: CalendarDays,
    label: "Events",
    title: "Campus Activities",
    text: "Open days, industry talks and skills workshops — check the latest schedule anytime.",
  },
  {
    icon: Newspaper,
    label: "News",
    title: "Latest Announcements",
    text: "Course updates, scholarship news and competition information, all in one place.",
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