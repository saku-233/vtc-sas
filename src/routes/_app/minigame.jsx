import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/PageHeader";
import CombatQuiz from "@/components/minigame/CombatQuiz";

export const Route = createFileRoute("/_app/minigame")({
  head: () => ({
    meta: [
      { title: "课程巩固 · VTC-SAS" },
      { name: "description", content: "限时知识空战 minigame，巩固课程要点。" },
    ],
  }),
  component: MinigamePage,
});

function MinigamePage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="MINIGAME"
        title="课程巩固"
        description="限时知识空战，击落目标、累积连击、巩固各科要点。"
      />
      <div className="mx-auto max-w-2xl">
        <CombatQuiz />
      </div>
    </div>
  );
}