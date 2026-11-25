import { Link } from "@tanstack/react-router";
import {
  LogOut,
  LogIn,
  Home,
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  CalendarCheck,
  MessageSquare,
  Bell,
  Gamepad2,
  User,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

const STUDENT_LINKS = [
  { to: "/", label: "首页", icon: Home, exact: true },
  { to: "/student/dashboard", label: "仪表板", icon: LayoutDashboard },
  { to: "/student/courses", label: "我的课程", icon: BookOpen },
  { to: "/student/assignments", label: "我的作业", icon: ClipboardList },
  { to: "/student/attendance", label: "出席", icon: CalendarCheck },
  { to: "/student/chat", label: "Chatbot", icon: MessageSquare },
  { to: "/student/reminders", label: "提醒", icon: Bell },
  { to: "/minigame", label: "课程巩固", icon: Gamepad2 },
  { to: "/student/profile", label: "我的档案", icon: User },
];

const TEACHER_LINKS = [
  { to: "/teacher", label: "首页", icon: Home, exact: true },
  { to: "/teacher/courses", label: "我的课程", icon: BookOpen },
  { to: "/teacher/assignments", label: "我发布的作业", icon: ClipboardList },
  { to: "/teacher/attendance", label: "出席", icon: CalendarCheck },
  { to: "/teacher/chat", label: "Chatbot", icon: MessageSquare },
  { to: "/teacher/reminders", label: "提醒", icon: Bell },
  { to: "/teacher/profile", label: "我的档案", icon: User },
];

export default function AppNav() {
  const { user, logout, navigateToLogin } = useAuth();
  const isTeacher = user?.role === "admin";
  const links = user ? (isTeacher ? TEACHER_LINKS : STUDENT_LINKS) : [];
  const initial = (user?.email || user?.full_name || "?").charAt(0).toUpperCase();
  const brandTo = user ? (isTeacher ? "/teacher" : "/student/dashboard") : "/";

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-5 sm:gap-8 sm:px-8">
        <Link to={brandTo} className="flex shrink-0 items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-primary text-[11px] font-semibold tracking-tight text-primary-foreground">
            VS
          </span>
          <strong className="font-heading text-[15px] font-semibold tracking-[0.16em] text-foreground">
            VTC-SAS
          </strong>
        </Link>

        {links.length > 0 ? (
          <nav className="-mx-1 flex flex-1 items-center gap-0.5 overflow-x-auto py-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  activeOptions={{ exact: !!link.exact }}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] text-muted-foreground transition-colors duration-200 hover:text-foreground"
                  activeProps={{ className: "bg-secondary font-medium text-foreground" }}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        ) : (
          <div className="flex-1" />
        )}

        {user ? (
          <div className="flex shrink-0 items-center gap-2">
            <span
              className="hidden h-8 w-8 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary sm:grid"
              title={user.email}
            >
              {initial}
            </span>
            <span className="hidden text-[11px] text-muted-foreground sm:block">
              {isTeacher ? "教师" : "学生"}
            </span>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              <LogOut className="h-3.5 w-3.5" />
              退出
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => navigateToLogin()}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <LogIn className="h-3.5 w-3.5" />
            登录
          </button>
        )}
      </div>
    </header>
  );
}