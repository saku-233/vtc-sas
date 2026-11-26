import { createFileRoute, redirect } from "@tanstack/react-router";

// Redirects the obsolete teacher promotion route away from Base44 behavior.
export const Route = createFileRoute("/auth/promote-teacher")({
  ssr: false,
  beforeLoad: () => redirect({ to: "/login", reloadDocument: true }),
});