import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { GraduationCap, Loader2, Mail, Shield, UserPlus, Users } from "lucide-react";
import { inviteAppUser } from "@/lib/server-fns";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function RoleBadge({ role }) {
  const isAdmin = role === "admin";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${
        isAdmin ? "bg-blue-50 text-blue-700" : "bg-emerald-50 text-emerald-700"
      }`}
    >
      {isAdmin ? <Shield className="h-3 w-3" /> : <GraduationCap className="h-3 w-3" />}
      {isAdmin ? "Teacher / Admin" : "Student"}
    </span>
  );
}

export default function UserManagement({ users }) {
  const router = useRouter();
  const invite = useServerFn(inviteAppUser);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [busy, setBusy] = useState(false);

  const admins = users.filter((u) => u.role === "admin");
  const students = users.filter((u) => u.role === "user");

  async function submit(e) {
    e.preventDefault();
    if (!email) return;
    setBusy(true);
    try {
      await invite({ data: { email, role } });
      toast.success("Invitation sent", { description: `${email} will receive a join email` });
      setEmail("");
      router.invalidate();
    } catch (err) {
      toast.error("Invitation failed", { description: err?.message ?? "Please try again later" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border/80 bg-card p-5">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium uppercase tracking-[0.16em]">Total users</span>
          </div>
          <p className="mt-2 font-heading text-[28px] leading-none text-foreground">{users.length}</p>
        </div>
        <div className="rounded-2xl border border-border/80 bg-card p-5">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Shield className="h-4 w-4 text-blue-600" />
            <span className="text-xs font-medium uppercase tracking-[0.16em]">Teachers / Admins</span>
          </div>
          <p className="mt-2 font-heading text-[28px] leading-none text-foreground">{admins.length}</p>
        </div>
        <div className="rounded-2xl border border-border/80 bg-card p-5">
          <div className="flex items-center gap-2 text-muted-foreground">
            <GraduationCap className="h-4 w-4 text-emerald-600" />
            <span className="text-xs font-medium uppercase tracking-[0.16em]">Students</span>
          </div>
          <p className="mt-2 font-heading text-[28px] leading-none text-foreground">{students.length}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border/80 bg-card p-6">
        <h2 className="font-heading text-lg text-foreground">Invite a new user</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Invitees receive an email and, after signing in with the fixed password 123456, are assigned the selected role.
        </p>
        <form onSubmit={submit} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="invite-email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="invite-email"
                type="email"
                placeholder="someone@vtc.edu.hk"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <div className="grid grid-cols-2 gap-1 rounded-lg border border-border bg-muted/40 p-1">
              {[
                { value: "user", label: "Student" },
                { value: "admin", label: "Teacher" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRole(opt.value)}
                  className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                    role === opt.value
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={busy || !email}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            Send invite
          </button>
        </form>
      </div>

      <div className="rounded-2xl border border-border/80 bg-card overflow-hidden">
        <div className="border-b border-border/70 px-6 py-4">
          <h2 className="font-heading text-lg text-foreground">All users</h2>
          <p className="mt-1 text-sm text-muted-foreground">{users.length} accounts, newest first.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-6 py-3 font-medium">User</th>
                <th className="px-6 py-3 font-medium">Role</th>
                <th className="px-6 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-muted/30">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {(u.full_name || u.email || "?").charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <p className="font-medium text-foreground">{u.full_name || "(unnamed)"}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3"><RoleBadge role={u.role} /></td>
                  <td className="px-6 py-3 text-muted-foreground">
                    {u.created_date
                      ? new Date(u.created_date).toLocaleDateString("en-GB", { timeZone: "Asia/Hong_Kong" })
                      : "—"}
                  </td>
                </tr>
              ))}
              {users.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-10 text-center text-muted-foreground">
                    No users yet
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}