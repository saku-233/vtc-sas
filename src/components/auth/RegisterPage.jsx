import { GraduationCap, Lock, Mail, UserPlus, User2 } from "lucide-react";
import { useState } from "react";
import { localApi } from "@/api/localClient";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthError, AuthLink, SubmitButton } from "@/components/auth/parts";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { safeReturnTo } from "@/lib/authReturnTo";

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

export function RegisterPage() {
	const returnTo = safeReturnTo();
	const [role, setRole] = useState("student");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [busy, setBusy] = useState(false);
	const activeRole = ROLES.find((r) => r.key === role);

	async function register(e) {
		e.preventDefault();
		setError("");
		setBusy(true);
		try {
			await localApi.auth.register({ email, password, role });
			await localApi.auth.login({ email, password, role });
			window.location.href = activeRole.home;
		} catch (err) {
			setError(err.message || "註冊失敗");
			setBusy(false);
		}
	}

	return (
		<AuthLayout icon={UserPlus} title="Create your account" subtitle="Pick a role to start">
			<div className="mb-4 grid grid-cols-2 gap-3">
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
							<span
								className={`grid h-9 w-9 place-items-center rounded-md ${
									active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
								}`}
							>
								<Icon className="h-4 w-4" />
							</span>
							<span className="mt-1 text-sm font-medium">{r.label}</span>
							<span className="text-xs text-muted-foreground">{r.desc}</span>
						</button>
					);
				})}
			</div>
			<AuthError>{error}</AuthError>
			<form onSubmit={register} className="mt-4 space-y-4">
				<div className="space-y-2">
					<Label htmlFor="register-email">Email</Label>
					<div className="relative">
						<Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							id="register-email"
							type="email"
							autoComplete="email"
							autoFocus
							placeholder={activeRole.placeholder}
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="h-12 pl-10"
							disabled={busy}
							required
						/>
					</div>
				</div>
				<div className="space-y-2">
					<Label htmlFor="register-password">Password</Label>
					<div className="relative">
						<Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							id="register-password"
							type="password"
							autoComplete="new-password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="h-12 pl-10"
							disabled={busy}
							required
						/>
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