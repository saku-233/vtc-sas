import { createFileRoute, Outlet } from "@tanstack/react-router";
import AppNav from "@/components/AppNav";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto max-w-6xl px-5 pb-24 pt-10 sm:px-8 sm:pt-14">
        <Outlet />
      </main>
    </div>
  );
}