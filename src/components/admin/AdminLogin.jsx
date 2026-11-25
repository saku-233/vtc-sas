import { useState } from "react";
import { Loader2, Mail, Shield } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { loginWithMfa } from "@/lib/authMfa";
import { FIXED_PASSWORD } from "@/lib/schoolEmail";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const isUnverifiedEmail = (err) => /verify your email/i.test(err?.message ?? "");

export default function AdminLogin({ onLoggedIn }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await loginWithMfa(email, FIXED_PASSWORD || undefined);
      await onLoggedIn();
    } catch (err) {
      if (isUnverifiedEmail(err)) {
        try {
          await base44.auth.resendOtp(email);
          setOtpStep(true);
        } catch {
          setError("无法发送验证码，请稍后再试。");
        }
      } else {
        setError(err?.message || "登录失败，请检查邮箱是否为管理员账户。");
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
      await onLoggedIn();
    } catch (err) {
      setError(err?.message || "验证码无效");
      setBusy(false);
    }
  }

  if (otpStep) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-6">
        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-3 text-center">
            <Shield className="mx-auto h-10 w-10 text-primary" />
            <h1 className="font-heading text-xl text-foreground">验证管理员邮箱</h1>
            <p className="text-sm text-muted-foreground">
              我们已向 <span className="font-medium text-foreground">{email}</span> 发送 6 位验证码。
            </p>
          </div>
          {error ? <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}
          <form onSubmit={verify} className="space-y-4">
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode} autoFocus autoComplete="one-time-code">
                <InputOTPGroup>
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <InputOTPSlot key={i} index={i} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
            <button
              type="submit"
              disabled={busy || otpCode.length < 6}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              验证并登录
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen place-items-center bg-background px-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-3 text-center">
          <Shield className="mx-auto h-10 w-10 text-primary" />
          <h1 className="font-heading text-xl text-foreground">超级管理员登录</h1>
          <p className="text-sm text-muted-foreground">此为独立入口，仅限管理员（教师）账户登录。</p>
        </div>
        {error ? <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-email">管理员电邮</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="admin-email"
                type="email"
                autoComplete="email"
                autoFocus
                placeholder="admin@vtc.edu.hk"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={busy || !email}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
            登录管理后台
          </button>
        </form>
      </div>
    </div>
  );
}