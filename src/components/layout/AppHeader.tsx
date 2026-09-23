"use client";

import type { Ref } from "react";

import { DemoOnly } from "@/components/demo/DemoOnly";
import { useAuth } from "@/context/auth/AuthProvider";
import { isDemoMode } from "@/lib/uiMode";

export type AppHeaderProps = {
  breadcrumb?: string;
  title: string;
  subtitle?: string;
  badges?: string[];
  isMenuOpen: boolean;
  menuButtonRef: Ref<HTMLButtonElement>;
  onOpenMenu: () => void;
};

export function AppHeader({
  breadcrumb,
  title,
  subtitle,
  badges = [],
  isMenuOpen,
  menuButtonRef,
  onOpenMenu,
}: AppHeaderProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const isDemo = isDemoMode();
  const visibleBreadcrumb =
    isDemo || breadcrumb?.includes("Sprint") !== true ? breadcrumb : undefined;
  const visibleBadges = isDemo ? badges : [];
  const sessionLabel = isLoading
    ? "Cargando sesión"
    : isAuthenticated && user !== null
      ? `${user.fullName} · ${user.role}`
      : !isAuthenticated
        ? "Sin sesión"
        : null;

  return (
    <header className="flex min-h-16 flex-col gap-3 border-b border-[var(--border)] bg-[rgba(59,10,24,0.92)] px-5 py-4 backdrop-blur md:flex-row md:items-center md:justify-between">
      <div className="flex items-start gap-3">
        <button
          aria-controls="app-navigation"
          aria-expanded={isMenuOpen}
          aria-label="Abrir menú de navegación"
          className="mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-md border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] md:hidden"
          onClick={onOpenMenu}
          ref={menuButtonRef}
          type="button"
        >
          <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="min-w-0">
          {visibleBreadcrumb !== undefined ? (
            <p className="text-xs text-[var(--muted)]">{visibleBreadcrumb}</p>
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
      </div>

      {visibleBadges.length > 0 || sessionLabel !== null ? (
        <div className="flex flex-wrap items-center gap-2">
          {visibleBadges.map((badge) => (
            <span
              className="rounded-full border border-[var(--gold)] bg-[rgba(201,168,93,0.12)] px-3 py-1 text-xs font-semibold text-[var(--gold-soft)]"
              key={badge}
            >
              {badge}
            </span>
          ))}
          {sessionLabel !== null ? (
            <span className="rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--muted)]">
              {sessionLabel}
            </span>
          ) : null}
          {user !== null ? (
            <DemoOnly>
              <span className="rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--muted)]">
                Sesión simulada
              </span>
            </DemoOnly>
          ) : null}
        </div>
      ) : null}
    </header>
  );
}
