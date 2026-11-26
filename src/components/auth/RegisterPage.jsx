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
    label: "Student",
    desc: "View courses, assignments and attendance",
    icon: User2,
    placeholder: "you@stu.vtc.edu.hk",
    home: "/student/dashboard",
  },
  {
    key: "teacher",
    label: "Teacher",
    desc: "Manage courses, post assignments and take attendance",
    icon: GraduationCap,
    placeholder: "you@vtc.edu.hk",
    home: "/teacher",
  },
];

/**
 * The /register page: pick a role → register → OTP → verifyOtp → setToken.
 * Choosing Teacher promotes the verified account to admin (teacher) role.
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
      setError(err.message || "Registration failed");
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
      // Teacher registration: promote the account to admin, then redirect to the teacher home.
      if (role === "teacher") {
        try {
          await promote({ data: {} });
        } catch {
          // If promotion fails, continue as a student to avoid getting stuck.
        }
        window.location.href = activeRole.home;
        return;
      }
      window.location.href = activeRole.home;
    } catch (err) {
      if (isAlreadyVerified(err)) setStep("already_verified");
      else setError(err.message || "Invalid code");
      setBusy(false);
    }
  }

  async function resend() {
    setError("");
    try {
      await base44.auth.resendOtp(email);
      toast("Code sent", { description: "Check your email for the latest code." });
    } catch (err) {
      if (isAlreadyVerified(err)) setStep("already_verified");
      else setError(err.message || "Couldn't send the code");
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
      <AuthLayout icon={UserPlus} title="Create your account" subtitle="Sign up to get started">
        <p className="mb-4 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{email}</span> is already verified — please sign in directly.
        </p>
        <AuthLink to="/login" returnTo={returnTo} className="inline-flex h-12 w-full items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90">
          Sign in
        </AuthLink>
      </AuthLayout>
    );
  }

  if (step === "otp") {
    return (
      <AuthLayout icon={UserPlus} title="Create your account" subtitle={`${activeRole.label} sign up`}>
        <form onSubmit={verify}>
          <p className="mb-4 text-sm text-muted-foreground">
            We sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>.
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
          <SubmitButton busy={busy} busyLabel="Verifying..." disabled={busy || otpCode.length < 6}>
            Verify
          </SubmitButton>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Didn't get a code?{" "}
            <button type="button" onClick={resend} className="font-medium text-primary hover:underline">
              Resend
            </button>
          </p>
        </form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout icon={UserPlus} title="Create your account" subtitle="Pick a role to start">
      <RolePicker />
      <AuthError>{error}</AuthError>
      <GoogleButton returnTo={returnTo} onError={setError} />
      <OrDivider />
      <form onSubmit={register} className="mt-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="register-email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input id="register-email" type="email" autoComplete="email" autoFocus placeholder={activeRole.placeholder} value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 pl-10" disabled={busy} required />
          </div>
        </div>
        <SubmitButton busy={busy} busyLabel="Creating...">
          Create {activeRole.label} account
        </SubmitButton>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <AuthLink to="/login" returnTo={returnTo}>
          Sign in
        </AuthLink>
      </p>
    </AuthLayout>
  );
}