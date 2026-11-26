import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import CombatGame3D from "@/components/minigame/CombatGame3D";
import { AuthGateError, requireSignedIn } from "@/components/auth/AuthGate";

export const Route = createFileRoute("/minigame")({
  ssr: false,
  beforeLoad: async ({ context, location }) => {
    const { user } = await requireSignedIn({ context, location });
    if (user.role !== "user") throw redirect({ to: "/" });
  },
  errorComponent: AuthGateError,
  head: () => ({
    meta: [
      { title: "Course Practice · 3D Air Combat · VTC-SAS" },
      { name: "description", content: "A timed 3D knowledge air combat game — shoot down targets, chain combos and reinforce each subject." },
    ],
  }),
  component: MinigamePage,
});

function MinigamePage() {
  return (
    <div className="fixed inset-0 z-50 h-screen w-screen bg-black">
      <CombatGame3D fullscreen />
      <Link
        to="/student/dashboard"
        className="absolute left-4 top-4 z-30 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 font-mono text-[12px] uppercase tracking-[0.18em] text-white backdrop-blur-md transition-colors hover:bg-white/20"
      >
        <ArrowLeft className="h-4 w-4" /> Exit
      </Link>
    </div>
  );
}