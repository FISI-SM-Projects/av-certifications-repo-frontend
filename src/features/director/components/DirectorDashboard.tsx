"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useAuth } from "@/features/auth/context/AuthProvider";
import { obtenerDocentesPorDepartamento } from "@/features/director/services/directorService";

const DEPARTAMENTO_ADMIN_DEMO = "Ingeniería de Software";

function obtenerDepartamentoConsulta(
  role: string | undefined,
  departamentoAcademico: string | null | undefined,
): string | null {
  if (departamentoAcademico !== null && departamentoAcademico !== undefined) {
    return departamentoAcademico;
  }

  if (role === "ADMIN") {
    return DEPARTAMENTO_ADMIN_DEMO;
  }

  return null;
}

export function DirectorDashboard() {
  const { user } = useAuth();
  const [cantidadDocentes, setCantidadDocentes] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const departamentoConsulta = obtenerDepartamentoConsulta(
    user?.role,
    user?.departamentoAcademico,
  );

  useEffect(() => {
    let isMounted = true;

    async function cargarResumen() {
      if (departamentoConsulta === null) {
        setCantidadDocentes(null);
        return;
      }

      try {
        setError(null);
        const docentes = await obtenerDocentesPorDepartamento(departamentoConsulta);

        if (isMounted) {
          setCantidadDocentes(docentes.length);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "No se pudo cargar el resumen de dirección",
          );
        }
      }
    }

    cargarResumen();

    return () => {
      isMounted = false;
    };
  }, [departamentoConsulta]);

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-[var(--border)] bg-[linear-gradient(135deg,rgba(25,36,30,0.98),rgba(20,29,24,0.98))] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.2)]">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
          Dirección académica
        </p>
        <h3 className="mt-2 text-2xl font-semibold text-[var(--text)]">
          {user?.fullName ?? "Usuario de dirección"}
        </h3>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-md border border-[var(--border-soft)] bg-[rgba(15,23,19,0.72)] p-3">
            <p className="text-xs text-[var(--muted)]">Rol</p>
            <p className="mt-1 font-semibold">{user?.role ?? "Sin rol"}</p>
          </div>
          <div className="rounded-md border border-[var(--border-soft)] bg-[rgba(15,23,19,0.72)] p-3">
            <p className="text-xs text-[var(--muted)]">Departamento académico</p>
            <p className="mt-1 font-semibold">
              {user?.departamentoAcademico ?? "Demo administrador: Ingeniería de Software"}
            </p>
          </div>
          <div className="rounded-md border border-[rgba(201,168,93,0.42)] bg-[rgba(201,168,93,0.1)] p-3">
            <p className="text-xs text-[var(--gold-soft)]">Sesión</p>
            <p className="mt-1 font-semibold text-[var(--gold-soft)]">Simulada</p>
          </div>
        </div>
      </section>

      {error !== null ? (
        <section className="rounded-lg border border-red-900/50 bg-[var(--danger-soft)] p-4 text-sm text-red-100">
          {error}
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--gold-soft)]">
            Docentes del departamento
          </p>
          <p className="mt-3 text-3xl font-semibold text-[var(--text)]">
            {cantidadDocentes ?? "..."}
          </p>
        </article>
        <article className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--gold-soft)]">
            Constancias pendientes
          </p>
          <p className="mt-3 text-sm font-semibold text-[var(--muted)]">Próximo sprint</p>
        </article>
        <article className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--gold-soft)]">
            Constancias aprobadas
          </p>
          <p className="mt-3 text-sm font-semibold text-[var(--muted)]">Próximo sprint</p>
        </article>
      </section>

      <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--gold-soft)]">
          Accesos rápidos
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/director/docentes"
            className="rounded-md bg-[var(--gold)] px-4 py-2 text-center text-sm font-semibold text-[#15130c] transition hover:bg-[var(--gold-soft)]"
          >
            Ver docentes
          </Link>
          <button
            type="button"
            disabled
            className="cursor-not-allowed rounded-md border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--muted)] opacity-60"
          >
            Constancias - Próximo sprint
          </button>
        </div>
      </section>
    </div>
  );
}
