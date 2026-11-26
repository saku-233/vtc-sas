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
          setError("Couldn't send the verification code. Please try again later.");
        }
      } else {
        setError(err?.message || "Sign in failed. Make sure the email is an admin account.");
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
      setError(err?.message || "Invalid code");
      setBusy(false);
    }
  }

  if (otpStep) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-6">
        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-3 text-center">
            <Shield className="mx-auto h-10 w-10 text-primary" />
            <h1 className="font-heading text-xl text-foreground">Verify admin email</h1>
            <p className="text-sm text-muted-foreground">
              We sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>.
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
              Verify and sign in
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
          <h1 className="font-heading text-xl text-foreground">Super admin sign in</h1>
          <p className="text-sm text-muted-foreground">This is a separate entrance for admin (teacher) accounts only.</p>
        </div>
        {error ? <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-email">Admin email</Label>
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
            Sign in to admin console
          </button>
        </form>
      </div>
    </div>
  );
}