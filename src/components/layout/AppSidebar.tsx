"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { DemoOnly } from "@/components/demo/DemoOnly";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { useAuth } from "@/context/auth/AuthProvider";
import { isDemoMode } from "@/lib/uiMode";
import type { RolUsuario } from "@/types/auth/auth.types";

type MenuItem = {
  label: string;
  href: string;
  disabled?: boolean;
  backendOnly?: boolean;
};

const MENU_BY_ROLE: Record<RolUsuario, MenuItem[]> = {
  DOCENTE: [
    { label: "Inicio", href: "/perfil-docente" },
    { label: "Carga académica", href: "/carga-academica", backendOnly: true },
    { label: "Mis constancias", href: "/constancias", backendOnly: true },
  ],
  DIRECTOR: [
    { label: "Dashboard", href: "/director" },
    { label: "Docentes", href: "/director/docentes" },
    { label: "Constancias", href: "/director/constancias" },
  ],
  ADMIN: [
    { label: "Dashboard", href: "/admin" },
    { label: "Docentes", href: "/director/docentes" },
    { label: "Constancias", href: "/director/constancias" },
    { label: "Administracion", href: "#", disabled: true },
    { label: "Configuracion", href: "#", disabled: true },
  ],
};

function isActivePath(pathname: string, href: string): boolean {
  if (href === "#") {
    return false;
  }

  if (href === "/") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user, teacher, roles, isLoading, isAuthenticated } = useAuth();
  const isDemo = isDemoMode();
  const menuItems = user !== null
    ? MENU_BY_ROLE[user.role].filter((item) => !item.backendOnly)
    : teacher !== null && roles.includes("DOCENTE")
      ? MENU_BY_ROLE.DOCENTE
      : [];
  const teacherName = teacher === null
    ? null
    : [teacher.firstName, teacher.paternalLastName, teacher.maternalLastName].filter(Boolean).join(" ");

  return (
    <aside className="flex min-h-full w-full flex-col border-r border-[var(--border)] bg-[rgba(27,5,12,0.96)] text-sm text-[var(--text)] md:min-h-screen md:w-64">
      <div className="border-b border-[var(--border)] py-5 pl-5 pr-14 md:pr-5">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-md border border-[rgba(201,168,93,0.7)] bg-[var(--surface-soft)] text-xs font-bold text-[var(--gold-soft)] shadow-[0_0_0_3px_rgba(201,168,93,0.06)]">
            FISI
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--gold-soft)]">
              UNMSM
            </p>
            <h1 className="text-lg font-semibold leading-tight">Gestión Docente</h1>
          </div>
        </div>
      </div>

      <div className="space-y-6 px-4 py-5">
        <section>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
            Sesión
          </p>
          <div className="rounded-md border border-[var(--border-soft)] bg-[var(--surface)] p-3">
            {isLoading ? (
              <p className="text-sm text-[var(--muted)]">Cargando sesión...</p>
            ) : isAuthenticated && user !== null ? (
              <>
                <p className="font-semibold">{user.fullName}</p>
                <p className="mt-1 text-xs text-[var(--gold-soft)]">{user.role}</p>
                {user.departamentoAcademico !== null ? (
                  <p className="mt-1 text-xs text-[var(--muted)]">{user.departamentoAcademico}</p>
                ) : null}
                <DemoOnly>
                  <p className="mt-2 text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">
                    Sesión simulada
                  </p>
                </DemoOnly>
              </>
            ) : isAuthenticated && teacher !== null ? (
              <>
                <p className="font-semibold">{teacherName}</p>
                <p className="mt-1 text-xs text-[var(--gold-soft)]">DOCENTE</p>
                {teacher.department !== null ? (
                  <p className="mt-1 text-xs text-[var(--muted)]">{teacher.department}</p>
                ) : null}
              </>
            ) : (
              <>
                <p className="font-semibold">Sin sesión</p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  {isDemo ? "Ingresa desde login demo" : "Inicia sesión para continuar"}
                </p>
              </>
            )}
          </div>
        </section>

        <section>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
            Trabajo
          </p>
          <nav className="space-y-1.5">
            {menuItems.length === 0 ? (
              <div className="rounded-md px-3 py-2.5 text-[var(--muted)] opacity-70">
                Sin menú disponible
              </div>
            ) : null}

            {menuItems.map((item) => {
              const isActive = isActivePath(pathname, item.href);
              const itemClassName = isActive
                ? "control-focus flex items-center justify-between rounded-md border border-[rgba(143,41,69,0.72)] bg-[var(--guinda)] px-3 py-2.5 font-medium text-[var(--text)] shadow-[inset_3px_0_0_var(--gold)]"
                : "control-focus flex items-center justify-between rounded-md px-3 py-2.5 text-[var(--muted)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--text)]";

              if (item.disabled) {
                return (
                  <div
                    className="flex cursor-not-allowed items-center justify-between rounded-md px-3 py-2.5 text-[var(--muted)] opacity-55"
                    key={item.label}
                  >
                    <span>{item.label}</span>
                    <span className="text-[11px]">futuro</span>
                  </div>
                );
              }

              return (
                <Link className={itemClassName} href={item.href} key={item.href} onClick={onNavigate}>
                  <span>{item.label}</span>
                  {isActive ? (
                    <span className="rounded-full bg-[var(--gold)] px-2 py-0.5 text-[11px] font-bold text-[#1b050c]">
                      activo
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </section>
      </div>

      <div className="mt-auto border-t border-[var(--border)] px-4 py-4">
        {isAuthenticated ? <LogoutButton className="w-full rounded-md border border-[var(--control-border)] px-4 py-2 text-sm font-medium text-[var(--text)] transition hover:border-[var(--gold)] hover:text-[var(--gold-soft)]" /> : null}
      </div>
    </aside>
  );
}
