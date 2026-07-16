"use client";

import { useAuth } from "@/features/auth/context/AuthProvider";

export type AppHeaderProps = {
  breadcrumb?: string;
  title: string;
  subtitle?: string;
  badges?: string[];
};

export function AppHeader({ breadcrumb, title, subtitle, badges = [] }: AppHeaderProps) {
  const { user, isLoading, isAuthenticated } = useAuth();

  return (
    <header className="flex min-h-16 flex-col gap-3 border-b border-[var(--border)] bg-[rgba(59,10,24,0.92)] px-5 py-4 backdrop-blur md:flex-row md:items-center md:justify-between">
      <div>
        {breadcrumb !== undefined ? (
          <p className="text-xs text-[var(--muted)]">{breadcrumb}</p>
        ) : null}
        <div className="mt-1 flex flex-wrap items-end gap-3">
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--text)]">
            {title}
          </h2>
          {subtitle !== undefined ? (
            <span className="pb-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--gold-soft)]">
              {subtitle}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {badges.map((badge) => (
          <span
            className="rounded-full border border-[var(--gold)] bg-[rgba(201,168,93,0.12)] px-3 py-1 text-xs font-semibold text-[var(--gold-soft)]"
            key={badge}
          >
            {badge}
          </span>
        ))}
        <span className="rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--muted)]">
          {isLoading
            ? "Cargando sesión"
            : isAuthenticated && user !== null
              ? `${user.fullName} · ${user.role}`
              : "Sin sesión"}
        </span>
        {isAuthenticated ? (
          <span className="rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--muted)]">
            Sesión simulada
          </span>
        ) : null}
        <button
          className="grid h-8 w-8 place-items-center rounded-md border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--gold-soft)]"
          type="button"
          title="Tema institucional"
        >
          ●
        </button>
      </div>
    </header>
  );
}
