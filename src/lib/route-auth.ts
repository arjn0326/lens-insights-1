import { redirect } from "@tanstack/react-router";
import { isAuthenticated } from "@/lib/demo-auth";

export function requireAuth() {
  if (!isAuthenticated()) {
    throw redirect({ to: "/" });
  }
}

export function redirectIfAuthenticated() {
  if (isAuthenticated()) {
    throw redirect({ to: "/app" });
  }
}
