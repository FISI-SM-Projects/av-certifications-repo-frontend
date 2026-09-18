"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { LogoutButton } from "@/components/auth/LogoutButton";
import { useAuth } from "@/context/auth/AuthProvider";
import { isDemoMode } from "@/lib/uiMode";
import type { Role, RolUsuario } from "@/types/auth/auth.types";

type RequireRoleProps = {
  allowedRoles: Array<Role | RolUsuario>;
  children: ReactNode;
};

function LoadingState() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 text-[var(--text)]">
      <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_18px_45px_rgba(0,0,0,0.22)]">
        <p className="text-sm text-[var(--muted)]">Verificando sesión...</p>
      </section>
    </main>
  );
}

function UnauthorizedState() {
  const isDemo = isDemoMode();

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 text-[var(--text)]">
      <section className="max-w-lg rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_18px_45px_rgba(0,0,0,0.22)]">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--gold-soft)]">
          Control visual de acceso
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-[var(--text)]">
          Acceso no autorizado
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          Tu rol actual no tiene permiso para acceder a esta sección.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/login-demo"
            className="rounded-md bg-[var(--gold)] px-4 py-2 text-center text-sm font-semibold text-[#15130c] transition hover:bg-[var(--gold-soft)]"
          >
            {isDemo ? "Volver al login demo" : "Volver al acceso"}
          </Link>
          <LogoutButton />
        </div>
      </section>
    </main>
  );
}

export function RequireRole({ allowedRoles, children }: RequireRoleProps) {
  const router = useRouter();
  const { user, roles, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login-demo");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (!isAuthenticated) {
    return <LoadingState />;
  }

  const activeRoles: Array<Role | RolUsuario> = user === null ? roles : [user.role];
  if (!activeRoles.some((role) => allowedRoles.includes(role))) {
    return <UnauthorizedState />;
  }

  return children;
}
