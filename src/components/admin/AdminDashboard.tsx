"use client";

import Link from "next/link";

import { useAuth } from "@/context/auth/AuthProvider";

const quickLinks = [
  {
    href: "/director",
    label: "Vista general de direccion",
    description: "Acceso al tablero de seguimiento institucional.",
  },
  {
    href: "/director/docentes",
    label: "Consultar docentes",
    description: "Consulta de docentes por departamento academico.",
  },
  {
    href: "/director/constancias",
    label: "Constancias",
    description: "Gestion departamental de constancias.",
  },
  {
    href: "/perfil-docente",
    label: "Perfil docente",
    description: "Acceso al perfil institucional docente.",
  },
];

export function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-[var(--border)] bg-[linear-gradient(135deg,rgba(90,15,36,0.98),rgba(59,10,24,0.98))] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.2)]">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
          Administracion
        </p>
        <h3 className="mt-2 text-2xl font-semibold text-[var(--text)]">
          {user?.fullName ?? "Administrador del sistema"}
        </h3>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
          Administra accesos y consulta las vistas institucionales disponibles para el rol ADMIN.
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
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
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
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
            Seguridad
          </p>
          <p className="mt-3 text-sm font-semibold text-[var(--muted)]">
            Control de acceso institucional
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

    </div>
  );
}
