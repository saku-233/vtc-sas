import { Link, createFileRoute } from "@tanstack/react-router";
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  CalendarCheck,
  MessageSquare,
  Bell,
  Gamepad2,
  User,
  LogIn,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { Image } from "@/components/ui/image";
import SchoolInfoBar from "@/components/home/SchoolInfoBar";

export const Route = createFileRoute("/_app/")({
  head: () => ({
    meta: [
      { title: "VTC-SAS · Smart Academic Scheduler" },
      { name: "description", content: "Welcome to the VTC-SAS student academic platform." },
    ],
  }),
  component: WelcomePage,
});

const NAV_CARDS = [
  { to: "/student/dashboard", icon: LayoutDashboard, title: "Dashboard", text: "An overview of courses, assignments and attendance." },
  { to: "/student/courses", icon: BookOpen, title: "My Courses", text: "This semester's subjects and class times." },
  { to: "/student/assignments", icon: ClipboardList, title: "My Assignments", text: "Deadlines, weightings and submission status." },
  { to: "/student/attendance", icon: CalendarCheck, title: "Attendance", text: "Per-class attendance records and statistics." },
  { to: "/student/chat", icon: MessageSquare, title: "Chatbot", text: "Ask about your academic schedule in conversation." },
  { to: "/student/reminders", icon: Bell, title: "Reminders", text: "Automatic reminders before assignment deadlines." },
  { to: "/minigame", icon: Gamepad2, title: "Course Practice", text: "Reinforce the semester's content with a knowledge air-combat game." },
  { to: "/student/profile", icon: User, title: "My Profile", text: "Course history, assignment records and attendance stats." },
];

const HERO_IMAGE =
  "https://media.base44.com/images/public/6afe60c183d2b0cd3452a1be/2b869fb455fcdf55dfced63bd0561461_generated_image.png";

function WelcomePage() {
  const { user, navigateToLogin } = useAuth();
  const isTeacher = user?.role === "admin";

  return (
    <div className="space-y-12">
      {/* Top: school info */}
      <section>
        <SchoolInfoBar />
      </section>

      {/* Middle: hero image */}
      <section className="relative overflow-hidden rounded-3xl border border-border/80 bg-card">
        <div className="relative aspect-[16/7] w-full">
          <Image
            src={HERO_IMAGE}
            alt="VTC campus"
            fittingType="fill"
            className="h-full w-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        </div>
        <div className="absolute inset-x-0 bottom-0 p-7 sm:p-12">
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-white/80">VTC-SAS</p>
          <h1 className="mt-3 max-w-2xl font-heading text-[30px] leading-[1.14] tracking-tight text-white sm:text-[44px]">
            Welcome to VTC-SAS
          </h1>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-white/85">
            Courses, assignments, attendance and a study assistant in one student portal. Sign in to enter your study workspace.
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => navigateToLogin()}
              className="group inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/5 px-6 py-3 text-sm font-medium text-white backdrop-blur-sm transition-all duration-300 hover:scale-[1.03] hover:border-white/80 hover:bg-white/20 hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.5)]"
            >
              <LogIn className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-px" />
              <span className="transition-transform duration-300 group-hover:translate-x-0.5">Sign in</span>
            </button>
          </div>
        </div>
      </section>

      {/* Quick access (signed-in students) */}
      {user && !isTeacher ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {NAV_CARDS.map((card) => (
            <Link
              key={card.to}
              to={card.to}
              className="group flex flex-col gap-3 rounded-2xl border border-border/80 bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_20px_44px_-30px_rgba(20,40,35,0.5)]"
            >
              <div className="flex items-center justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <card.icon className="h-5 w-5" />
                </span>
                <span className="text-lg text-muted-foreground transition-transform duration-300 group-hover:translate-x-0.5">
                  →
                </span>
              </div>
              <h2 className="font-heading text-base text-foreground">{card.title}</h2>
              <p className="text-[13px] text-muted-foreground">{card.text}</p>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}