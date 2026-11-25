import { GraduationCap, Lock, Mail, UserPlus, User2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { base44 } from "@/api/base44Client";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { MfaFlow } from "@/components/auth/MfaFlow";
import { MfaScreen } from "@/components/auth/MfaParts";
import { AuthError, AuthLink, GoogleButton, OrDivider, SubmitButton } from "@/components/auth/parts";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { promoteToTeacher } from "@/lib/server-fns";
import { safeReturnTo } from "@/lib/authReturnTo";
import { FIXED_PASSWORD } from "@/lib/schoolEmail";

const isAlreadyVerified = (err) => err?.status === 400 && /already verified/i.test(err?.message ?? "");

const ROLES = [
  {
    key: "student",
    label: "学生",
    desc: "查看课程、作业与出席记录",
    icon: User2,
    placeholder: "you@stu.vtc.edu.hk",
    home: "/student/dashboard",
  },
  {
    key: "teacher",
    label: "老师",
    desc: "管理课程、发布作业与点名",
    icon: GraduationCap,
    placeholder: "you@vtc.edu.hk",
    home: "/teacher",
  },
];

/**
 * The /register page: pick a role → register → OTP → verifyOtp → setToken.
 * Choosing 老师 promotes the verified account to admin (teacher) role.
 */
export function RegisterPage() {
  const returnTo = safeReturnTo();
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [step, setStep] = useState("form");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [mfaChallenge, setMfaChallenge] = useState(null);
  const promote = useServerFn(promoteToTeacher);

  const activeRole = ROLES.find((r) => r.key === role);

  async function register(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await base44.auth.register({ email, password: FIXED_PASSWORD });
      setStep("otp");
    } catch (err) {
      setError(err.message || "注册失败");
    } finally {
      setBusy(false);
    }
  }

  async function verify(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const result = await base44.auth.verifyOtp({ email, otpCode });
      if (result?.mfa_required) {
        setMfaChallenge(result);
        return;
      }
      if (result?.access_token) base44.auth.setToken(result.access_token);
      // 老师注册：先把账户提升为 admin，再跳转教师首页。
      if (role === "teacher") {
        try {
          await promote({ data: {} });
        } catch {
          // 提升失败则按学生身份继续，避免卡死。
        }
        window.location.href = activeRole.home;
        return;
      }
      window.location.href = activeRole.home;
    } catch (err) {
      if (isAlreadyVerified(err)) setStep("already_verified");
      else setError(err.message || "验证码无效");
      setBusy(false);
    }
  }

  async function resend() {
    setError("");
    try {
      await base44.auth.resendOtp(email);
      toast("验证码已发送", { description: "请查收邮件中的最新验证码。" });
    } catch (err) {
      if (isAlreadyVerified(err)) setStep("already_verified");
      else setError(err.message || "验证码发送失败");
    }
  }

  function RolePicker() {
    return (
      <div className="grid grid-cols-2 gap-3">
        {ROLES.map((r) => {
          const Icon = r.icon;
          const active = r.key === role;
          return (
            <button
              key={r.key}
              type="button"
              onClick={() => setRole(r.key)}
              className={`flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors ${
                active
                  ? "border-primary bg-accent text-accent-foreground"
                  : "border-border bg-background hover:bg-muted/50"
              }`}
            >
              <span className={`grid h-9 w-9 place-items-center rounded-md ${active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                <Icon className="h-4 w-4" />
              </span>
              <span className="mt-1 text-sm font-medium">{r.label}</span>
              <span className="text-xs text-muted-foreground">{r.desc}</span>
            </button>
          );
        })}
      </div>
    );
  }

  if (mfaChallenge) return <MfaScreen><MfaFlow challenge={mfaChallenge} returnTo={returnTo} /></MfaScreen>;

  if (step === "already_verified") {
    return (
      <AuthLayout icon={UserPlus} title="创建你的账户" subtitle="注册即可开始使用">
        <p className="mb-4 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{email}</span> 已通过验证，请直接登录。
        </p>
        <AuthLink to="/login" returnTo={returnTo} className="inline-flex h-12 w-full items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90">
          登录
        </AuthLink>
      </AuthLayout>
    );
  }

  if (step === "otp") {
    return (
      <AuthLayout icon={UserPlus} title="创建你的账户" subtitle={`${activeRole.label}注册`}>
        <form onSubmit={verify}>
          <p className="mb-4 text-sm text-muted-foreground">
            我们已向 <span className="font-medium text-foreground">{email}</span> 发送了 6 位验证码。
          </p>
          <AuthError>{error}</AuthError>
          <div className="mb-6 flex justify-center">
            <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode} autoFocus autoComplete="one-time-code">
              <InputOTPGroup>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <InputOTPSlot key={i} index={i} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
          <SubmitButton busy={busy} busyLabel="验证中..." disabled={busy || otpCode.length < 6}>
            验证
          </SubmitButton>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            没收到验证码？{" "}
            <button type="button" onClick={resend} className="font-medium text-primary hover:underline">
              重新发送
            </button>
          </p>
        </form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout icon={UserPlus} title="创建你的账户" subtitle="选择身份后开始注册">
      <RolePicker />
      <AuthError>{error}</AuthError>
      <form onSubmit={register} className="mt-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="register-email">电邮</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input id="register-email" type="email" autoComplete="email" autoFocus placeholder={activeRole.placeholder} value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 pl-10" disabled={busy} required />
          </div>
        </div>
        <SubmitButton busy={busy} busyLabel="创建中...">
          创建{activeRole.label}账户
        </SubmitButton>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        已有账户？{" "}
        <AuthLink to="/login" returnTo={returnTo}>
          登录
        </AuthLink>
      </p>
    </AuthLayout>
  );
}