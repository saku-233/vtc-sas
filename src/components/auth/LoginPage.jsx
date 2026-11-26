import { Lock, LogIn, Mail } from "lucide-react";
import { useState } from "react";
import { localApi } from "@/api/localClient";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthError, AuthLink, SubmitButton } from "@/components/auth/parts";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { safeReturnTo } from "@/lib/authReturnTo";

export function LoginPage() {
  const returnTo = safeReturnTo();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [role, setRole] = useState("student");

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await localApi.auth.login({ email, password, role });
      window.location.href = role === "teacher" ? "/teacher" : (safeReturnTo() === "/" ? "/student/dashboard" : safeReturnTo());
    } catch (err) {
      setError(err.message || "登入失敗，請檢查電郵或密碼");
      setBusy(false);
    }
  }

  return (
    <AuthLayout icon={LogIn} title="Welcome back" subtitle="Sign in to your local VTC-SAS account">
      <AuthError>{error}</AuthError>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-2 rounded-lg border border-border bg-muted/40 p-1">
          {[{ value: "student", label: "Student" }, { value: "teacher", label: "Teacher" }].map((opt) => (
            <button key={opt.value} type="button" onClick={() => setRole(opt.value)} className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${role === opt.value ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              {opt.label}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          <Label htmlFor="login-email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="login-email" type="email" autoComplete="email" autoFocus placeholder="you@stu.vtc.edu.hk" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 pl-10" required />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="login-password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="login-password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 pl-10" required />
          </div>
        </div>
        <SubmitButton busy={busy} busyLabel="Signing in...">Sign in</SubmitButton>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don't have an account? <AuthLink to="/register" returnTo={returnTo}>Create account</AuthLink>
      </p>
    </AuthLayout>
  );
}