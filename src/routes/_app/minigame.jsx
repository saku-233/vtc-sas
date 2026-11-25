import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/PageHeader";
import CombatGame3D from "@/components/minigame/CombatGame3D";

export const Route = createFileRoute("/_app/minigame")({
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
    <div className="space-y-8">
      <PageHeader
        eyebrow="MINIGAME · 3D"
        title="课程巩固 · 知识空战"
        description="驾驶战机在限时内击落目标（答对题目），速度越快、连击越高得分越多，游戏结束显示总分与排名。"
      />
      <CombatGame3D />
    </div>
  );
}