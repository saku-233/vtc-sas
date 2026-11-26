import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { base44 } from "@/api/base44Client";
import { promoteToTeacher } from "@/lib/server-fns";

// Landing point after a Google sign-up that chose the Teacher role. The platform
// redirects here with the session set; we promote the account to admin (teacher)
// and send the user to the teacher console.
export const Route = createFileRoute("/auth/promote-teacher")({
  ssr: false,
  head: () => ({ meta: [{ title: "Setting up teacher account" }] }),
  component: PromoteTeacher,
});

function PromoteTeacher() {
  const promote = useServerFn(promoteToTeacher);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const ok = await base44.auth.isAuthenticated();
        if (!ok) {
          window.location.href = "/login?returnTo=/auth/promote-teacher";
          return;
        }
        await promote({ data: {} });
        if (!alive) return;
        window.location.href = "/teacher";
      } catch (err) {
        if (!alive) return;
        setError(err?.message || "Couldn't set up your teacher account.");
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="text-center">
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : (
          <>
            <div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Setting up your teacher account…</p>
          </>
        )}
      </div>
    </div>
  );
}