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
      { title: "VTC-SAS · 智慧学业排程" },
      { name: "description", content: "欢迎来到 VTC-SAS 学生学业管理平台。" },
    ],
  }),
  component: WelcomePage,
});

const NAV_CARDS = [
  { to: "/student/dashboard", icon: LayoutDashboard, title: "仪表板", text: "课程、作业与出席的一览总览。" },
  { to: "/student/courses", icon: BookOpen, title: "我的课程", text: "本学期的科目与上课时间。" },
  { to: "/student/assignments", icon: ClipboardList, title: "我的作业", text: "截止日期、比重与提交状态。" },
  { to: "/student/attendance", icon: CalendarCheck, title: "出席", text: "每节课的出席记录与统计。" },
  { to: "/student/chat", icon: MessageSquare, title: "Chatbot", text: "用对话查询你的学业安排。" },
  { to: "/student/reminders", icon: Bell, title: "提醒", text: "作业截止前的自动提醒记录。" },
  { to: "/minigame", icon: Gamepad2, title: "课程巩固", text: "用知识空战巩固本学期内容。" },
  { to: "/student/profile", icon: User, title: "我的档案", text: "选课历史、作业记录与出席统计。" },
];

const HERO_IMAGE =
  "https://media.base44.com/images/public/6afe60c183d2b0cd3452a1be/2b869fb455fcdf55dfced63bd0561461_generated_image.png";

function WelcomePage() {
  const { user, navigateToLogin } = useAuth();
  const isTeacher = user?.role === "admin";

  return (
    <div className="space-y-12">
      {/* 顶部：本校资讯 */}
      <section>
        <SchoolInfoBar />
      </section>

      {/* 中间：主图 */}
      <section className="relative overflow-hidden rounded-3xl border border-border/80 bg-card">
        <div className="relative aspect-[16/7] w-full">
          <Image
            src={HERO_IMAGE}
            alt="VTC 校园"
            fittingType="fill"
            className="h-full w-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        </div>
        <div className="absolute inset-x-0 bottom-0 p-7 sm:p-12">
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-white/80">VTC-SAS</p>
          <h1 className="mt-3 max-w-2xl font-heading text-[30px] leading-[1.14] tracking-tight text-white sm:text-[44px]">
            欢迎来到 VTC-SAS 平台
          </h1>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-white/85">
            课程、作业、出席与学习助手集中在一个学生门户。登录后即可进入你的学习工作台。
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => navigateToLogin()}
              className="group inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/5 px-6 py-3 text-sm font-medium text-white backdrop-blur-sm transition-all duration-300 hover:scale-[1.03] hover:border-white/80 hover:bg-white/20 hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.5)]"
            >
              <LogIn className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-px" />
              <span className="transition-transform duration-300 group-hover:translate-x-0.5">登录</span>
            </button>
          </div>
        </div>
      </section>

      {/* 快速入口（已登录学生） */}
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