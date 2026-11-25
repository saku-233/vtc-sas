import { Lock, LogIn, Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthError, AuthLink, GoogleButton, OrDivider, SubmitButton } from "@/components/auth/parts";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { MfaFlow } from "@/components/auth/MfaFlow";
import { MfaScreen } from "@/components/auth/MfaParts";
import { loginWithMfa } from "@/lib/authMfa";
import { safeReturnTo } from "@/lib/authReturnTo";
import { FIXED_PASSWORD } from "@/lib/schoolEmail";

const isUnverifiedEmail = (err) => /verify your email/i.test(err?.message ?? "");

// The /login page. ?returnTo= (or the platform's ?from_url=) is where the visitor
// goes after signing in — the login gate and the MCP consent page send people here with it.
export function LoginPage() {
  const returnTo = safeReturnTo();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [mfaChallenge, setMfaChallenge] = useState(null);
  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [role, setRole] = useState("student");

  const targetPath = role === "teacher" ? "/teacher" : returnTo;

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const result = await loginWithMfa(email, FIXED_PASSWORD || undefined);
      if (result.mfa_required) {
        setMfaChallenge(result);
        return;
      }
      // A hard redirect: the app re-initializes with the new session.
      window.location.href = targetPath;
    } catch (err) {
      if (isUnverifiedEmail(err)) {
        // The account exists but the email was never verified. Send a fresh code
        // and let the user verify inline, right here on the login page.
        try {
          await base44.auth.resendOtp(email);
          setOtpStep(true);
          toast("验证码已发送", { description: "请查收邮件中的验证码。" });
        } catch {
          setError("无法发送验证码，请稍后再试。");
        }
      } else {
        setError(err.message || "Invalid email or password");
      }
      setBusy(false);
    }
  }

  async function verify(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const result = await base44.auth.verifyOtp({ email, otpCode });
      if (result?.access_token) base44.auth.setToken(result.access_token);
      window.location.href = targetPath;
    } catch (err) {
      setError(err.message || "验证码无效");
      setBusy(false);
    }
  }

  async function resend() {
    setError("");
    try {
      await base44.auth.resendOtp(email);
      toast("验证码已重新发送", { description: "请查收邮件中的最新验证码。" });
    } catch (err) {
      setError(err.message || "验证码发送失败");
    }
  }

  // The second sign-in step (authenticator app or text message) replaces the whole page.
  if (mfaChallenge) return <MfaScreen><MfaFlow challenge={mfaChallenge} returnTo={returnTo} /></MfaScreen>;

  if (otpStep) {
    return (
      <AuthLayout icon={LogIn} title="验证你的邮箱" subtitle="输入邮件中的 6 位验证码完成登录">
        <p className="mb-4 text-sm text-muted-foreground">
          我们已向 <span className="font-medium text-foreground">{email}</span> 发送了验证码。
        </p>
        <AuthError>{error}</AuthError>
        <form onSubmit={verify}>
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
            验证并登录
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
    <AuthLayout icon={LogIn} title="欢迎回来" subtitle="登录你的账户">

      <AuthError>{error}</AuthError>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-2 rounded-lg border border-border bg-muted/40 p-1">
          {[
            { value: "student", label: "学生" },
            { value: "teacher", label: "教师" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setRole(opt.value)}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                role === opt.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          <Label htmlFor="login-email">电邮</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input id="login-email" type="email" autoComplete="email" autoFocus placeholder="you@stu.vtc.edu.hk" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 pl-10" required />
          </div>
        </div>
        <SubmitButton busy={busy} busyLabel="登录中...">
          登录
        </SubmitButton>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        还没有账户？{" "}
        <AuthLink to="/register" returnTo={returnTo}>
          注册账户
        </AuthLink>
      </p>
    </AuthLayout>
  );
}