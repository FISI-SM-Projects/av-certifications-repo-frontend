"use client";

import { useRouter } from "next/navigation";

import { useAuth } from "@/context/auth/AuthProvider";
import { isDemoMode } from "@/lib/uiMode";

type LogoutButtonProps = {
  className?: string;
};

export function LogoutButton({ className }: LogoutButtonProps) {
  const router = useRouter();
  const { logout } = useAuth();
  const loginPath = isDemoMode() ? "/login-demo" : "/login";

  function handleLogout() {
    logout();
    router.push(loginPath);
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className={
        className ??
        "rounded-md border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--text)] transition hover:border-[var(--gold)] hover:text-[var(--gold-soft)]"
      }
    >
      Cerrar sesión
    </button>
  );
}
