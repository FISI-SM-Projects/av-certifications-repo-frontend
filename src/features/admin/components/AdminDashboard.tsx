"use client";

import Link from "next/link";

import { useAuth } from "@/features/auth/context/AuthProvider";

const quickLinks = [
  {
    href: "/director",
    label: "Vista general de direccion",
    description: "Reutiliza el dashboard preparado para seguimiento institucional.",
  },
  {
    href: "/director/docentes",
    label: "Consultar docentes",
    description: "Acceso a la consulta de docentes por departamento en modo demo.",
  },
  {
    href: "/director/constancias",
    label: "Constancias",
    description: "Abre el placeholder del futuro flujo de aprobacion.",
  },
  {
    href: "/perfil-docente",
    label: "Perfil docente demo",
    description: "Permite validar la vista docente existente del Sprint 1.",
  },
];

const futureModules = [
  "Gestion de usuarios",
  "Gestion de roles",
  "Gestion de departamentos",
  "Configuracion del sistema",
  "Auditoria",
];

export function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-[var(--border)] bg-[linear-gradient(135deg,rgba(90,15,36,0.98),rgba(59,10,24,0.98))] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.2)]">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
          Administracion simulada
        </p>
        <h3 className="mt-2 text-2xl font-semibold text-[var(--text)]">
          {user?.fullName ?? "Administrador del sistema"}
        </h3>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
          Esta vista centraliza accesos de validacion para el rol ADMIN. No incluye
          gestion real, cambios de configuracion ni operaciones administrativas.
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-md border border-[var(--border-soft)] bg-[rgba(27,5,12,0.72)] p-3">
            <p className="text-xs text-[var(--muted)]">Correo</p>
            <p className="mt-1 break-words font-semibold">
              {user?.email ?? "Sin correo activo"}
            </p>
          </div>
          <div className="rounded-md border border-[var(--border-soft)] bg-[rgba(27,5,12,0.72)] p-3">
            <p className="text-xs text-[var(--muted)]">Rol</p>
            <p className="mt-1 font-semibold">{user?.role ?? "Sin rol"}</p>
          </div>
          <div className="rounded-md border border-[rgba(201,168,93,0.42)] bg-[rgba(201,168,93,0.1)] p-3">
            <p className="text-xs text-[var(--gold-soft)]">Sesion</p>
            <p className="mt-1 font-semibold text-[var(--gold-soft)]">Simulada</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--gold-soft)]">
            Areas visibles
          </p>
          <p className="mt-3 text-3xl font-semibold text-[var(--text)]">
            {quickLinks.length}
          </p>
        </article>
        <article className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--gold-soft)]">
            Modulos futuros
          </p>
          <p className="mt-3 text-3xl font-semibold text-[var(--text)]">
            {futureModules.length}
          </p>
        </article>
        <article className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--gold-soft)]">
            Seguridad
          </p>
          <p className="mt-3 text-sm font-semibold text-[var(--muted)]">
            Sin autenticacion real
          </p>
        </article>
      </section>

      <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--gold-soft)]">
          Accesos rapidos
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {quickLinks.map((link) => (
            <Link
              className="rounded-lg border border-[var(--border-soft)] bg-[rgba(27,5,12,0.72)] p-4 transition hover:border-[rgba(201,168,93,0.55)] hover:bg-[rgba(90,15,36,0.75)]"
              href={link.href}
              key={link.href}
            >
              <span className="font-semibold text-[var(--text)]">{link.label}</span>
              <span className="mt-1 block text-sm leading-6 text-[var(--muted)]">
                {link.description}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--gold-soft)]">
          Modulos administrativos futuros
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {futureModules.map((moduleName) => (
            <article
              className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface-soft)] p-4 opacity-70"
              key={moduleName}
            >
              <p className="font-semibold text-[var(--text)]">{moduleName}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Disponible en sprint futuro
              </p>
              <button
                className="mt-4 cursor-not-allowed rounded-md border border-[var(--border)] px-3 py-2 text-xs font-semibold text-[var(--muted)]"
                disabled
                type="button"
              >
                No disponible
              </button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
