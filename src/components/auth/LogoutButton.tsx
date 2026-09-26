"use client";

import { useRouter } from "next/navigation";

import { useAuth } from "@/context/auth/AuthProvider";
import { isDemoAccessEnabled } from "@/lib/uiMode";

type LogoutButtonProps = {
  className?: string;
};

export function LogoutButton({ className }: LogoutButtonProps) {
  const router = useRouter();
  const { logout, token, user } = useAuth();

  function handleLogout() {
    const hasLegacySession = token === null && user !== null;
    const loginPath = hasLegacySession && isDemoAccessEnabled() ? "/login-demo" : "/login";
    logout();
    router.push(loginPath);
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className={
        `${className ??
          "rounded-md border border-[var(--control-border)] px-4 py-2 text-sm font-medium text-[var(--text)] transition hover:border-[var(--gold)] hover:text-[var(--gold-soft)]"} control-focus`
      }
    >
      Cerrar sesión
    </button>
  );
}
