import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import CombatGame3D from "@/components/minigame/CombatGame3D";

export const Route = createFileRoute("/minigame")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "课程巩固 · 3D 空战 · VTC-SAS" },
      { name: "description", content: "限时 3D 知识空战，击落目标、累积连击、巩固各科要点。" },
    ],
  }),
  component: MinigamePage,
});

function MinigamePage() {
  return (
    <div className="fixed inset-0 z-50 h-screen w-screen bg-black">
      <CombatGame3D fullscreen />
      <Link
        to="/"
        className="absolute left-4 top-4 z-30 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 font-mono text-[12px] uppercase tracking-[0.18em] text-white backdrop-blur-md transition-colors hover:bg-white/20"
      >
        <ArrowLeft className="h-4 w-4" /> 退出
      </Link>
    </div>
  );
}