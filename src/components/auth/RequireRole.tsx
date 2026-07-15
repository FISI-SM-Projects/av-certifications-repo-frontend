"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { LogoutButton } from "@/features/auth/components/LogoutButton";
import { useAuth } from "@/features/auth/context/AuthProvider";
import type { RolUsuario } from "@/features/auth/types/auth.types";

type RequireRoleProps = {
  allowedRoles: RolUsuario[];
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
            Volver al login demo
          </Link>
          <LogoutButton />
        </div>
      </section>
    </main>
  );
}

export function RequireRole({ allowedRoles, children }: RequireRoleProps) {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login-demo");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (!isAuthenticated || user === null) {
    return <LoadingState />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <UnauthorizedState />;
  }

  return children;
}
