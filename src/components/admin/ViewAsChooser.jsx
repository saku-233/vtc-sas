import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Eye, GraduationCap, Search, Shield, Users } from "lucide-react";
import { useViewAs } from "@/lib/ViewAsContext";
import { Input } from "@/components/ui/input";

export default function ViewAsChooser({ users }) {
  const navigate = useNavigate();
  const { setViewAs } = useViewAs();
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (!q) return true;
      return (u.email ?? "").toLowerCase().includes(q) || (u.full_name ?? "").toLowerCase().includes(q);
    });
  }, [users, query, roleFilter]);

  function choose(u) {
    setViewAs(u);
    navigate({ to: u.role === "admin" ? "/teacher" : "/student/dashboard" });
  }

  return (
    <div className="rounded-2xl border border-border/80 bg-card overflow-hidden">
      <div className="border-b border-border/70 px-6 py-4">
        <div className="flex items-center gap-2 text-primary">
          <Users className="h-4 w-4" />
          <h2 className="font-heading text-lg text-foreground">以用户身份查看</h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          选择一个学生或教师，将以该用户的视角浏览其页面（导航与主题随之切换）。数据读取仍使用你的管理员权限。
        </p>
      </div>

      <div className="flex flex-col gap-3 border-b border-border/60 px-6 py-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="按邮箱或姓名搜索，如 250002058@stu.vtc.edu.hk"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="grid grid-cols-3 gap-1 rounded-lg border border-border bg-muted/40 p-1">
          {[
            { value: "all", label: "全部" },
            { value: "user", label: "学生" },
            { value: "admin", label: "教师" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setRoleFilter(opt.value)}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                roleFilter === opt.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-h-[420px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-6 py-3 font-medium">用户</th>
              <th className="px-6 py-3 font-medium">角色</th>
              <th className="px-6 py-3 text-right font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {filtered.map((u) => {
              const isAdmin = u.role === "admin";
              return (
                <tr key={u.id} className="hover:bg-muted/30">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {(u.full_name || u.email || "?").charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <p className="font-medium text-foreground">{u.full_name || "（未命名）"}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                        isAdmin ? "bg-blue-50 text-blue-700" : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {isAdmin ? <Shield className="h-3 w-3" /> : <GraduationCap className="h-3 w-3" />}
                      {isAdmin ? "教师" : "学生"}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => choose(u)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      以此身份查看
                    </button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-10 text-center text-muted-foreground">
                  没有匹配的用户
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}