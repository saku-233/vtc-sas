import { createFileRoute, redirect } from "@tanstack/react-router";

// User management is a separate entrance at /admin; this route redirects there.
export const Route = createFileRoute("/_app/teacher/users")({
  beforeLoad: () => {
    throw redirect({ to: "/admin" });
  },
  component: () => null,
});