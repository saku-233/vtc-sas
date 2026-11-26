import { useState } from "react";
import { Loader2, Mail, Shield } from "lucide-react";
import { localApi } from "@/api/localClient";
import { FIXED_PASSWORD } from "@/lib/schoolEmail";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLogin({ onLoggedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(FIXED_PASSWORD || "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await localApi.auth.login({ email, password, role: "teacher" });
      await onLoggedIn();
    } catch (err) {
      setError(err?.message || "Sign in failed. Make sure the email is an admin account.");
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-background px-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-3 text-center">
          <Shield className="mx-auto h-10 w-10 text-primary" />
          <h1 className="font-heading text-xl text-foreground">Super admin sign in</h1>
          <p className="text-sm text-muted-foreground">This entrance is for admin (teacher) accounts only.</p>
        </div>
        {error ? <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="admin-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 pl-10" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-password">Password</Label>
            <Input id="admin-password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12" required />
          </div>
          <button type="submit" disabled={busy} className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}