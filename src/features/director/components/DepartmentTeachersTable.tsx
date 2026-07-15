"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useAuth } from "@/features/auth/context/AuthProvider";
import { obtenerDocentesPorDepartamento } from "@/features/director/services/directorService";
import type { DirectorDocenteListado } from "@/features/director/types/director.types";

const DEPARTAMENTO_ADMIN_DEMO = "Ingeniería de Software";

function obtenerDepartamentoConsulta(
  role: string | undefined,
  departamentoAcademico: string | null | undefined,
): { departamento: string | null; nota: string | null } {
  if (departamentoAcademico !== null && departamentoAcademico !== undefined) {
    return { departamento: departamentoAcademico, nota: null };
  }

  if (role === "ADMIN") {
    return {
      departamento: DEPARTAMENTO_ADMIN_DEMO,
      nota: "Vista demo de ADMIN usando Ingeniería de Software hasta completar el panel administrativo.",
    };
  }

  return {
    departamento: null,
    nota: "No hay Departamento Académico asociado a la sesión actual.",
  };
}

export function DepartmentTeachersTable() {
  const { user } = useAuth();
  const [docentes, setDocentes] = useState<DirectorDocenteListado[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { departamento, nota } = obtenerDepartamentoConsulta(
    user?.role,
    user?.departamentoAcademico,
  );

  useEffect(() => {
    let isMounted = true;

    async function cargarDocentes() {
      if (departamento === null) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const docentesDepartamento = await obtenerDocentesPorDepartamento(departamento);

        if (isMounted) {
          setDocentes(docentesDepartamento);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "No se pudo cargar el listado de docentes",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    cargarDocentes();

    return () => {
      isMounted = false;
    };
  }, [departamento]);

  if (isLoading) {
    return (
      <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
        <p className="text-sm text-[var(--muted)]">Cargando docentes del departamento...</p>
      </section>
    );
  }

  if (error !== null) {
    return (
      <section className="rounded-lg border border-red-900/50 bg-[var(--danger-soft)] p-5 text-sm text-red-100">
        {error}
      </section>
    );
  }

  if (departamento === null) {
    return (
      <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
        <p className="text-sm text-[var(--muted)]">{nota}</p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)]">
      <div className="border-b border-[var(--border)] px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--gold-soft)]">
          Docentes
        </p>
        <h3 className="mt-1 text-base font-semibold">{departamento}</h3>
        {nota !== null ? <p className="mt-1 text-sm text-[var(--muted)]">{nota}</p> : null}
      </div>

      {docentes.length === 0 ? (
        <p className="p-5 text-sm text-[var(--muted)]">No hay docentes para este departamento.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[rgba(25,36,30,0.95)] text-[var(--muted)]">
                <th className="px-5 py-3 font-semibold">Código</th>
                <th className="px-5 py-3 font-semibold">Docente</th>
                <th className="px-5 py-3 font-semibold">Correo</th>
                <th className="px-5 py-3 font-semibold">Categoría</th>
                <th className="px-5 py-3 font-semibold">Condición</th>
                <th className="px-5 py-3 text-right font-semibold">Acción</th>
              </tr>
            </thead>
            <tbody>
              {docentes.map((docente) => (
                <tr
                  className="border-b border-[var(--border-soft)] transition hover:bg-[rgba(25,36,30,0.86)]"
                  key={docente.teacherCode}
                >
                  <td className="px-5 py-4 font-semibold text-[var(--gold-soft)]">
                    {docente.teacherCode}
                  </td>
                  <td className="px-5 py-4 text-[var(--text)]">
                    {docente.nombres} {docente.apellidos}
                  </td>
                  <td className="px-5 py-4 text-[var(--muted)]">
                    {docente.correoInstitucional}
                  </td>
                  <td className="px-5 py-4 text-[var(--muted)]">{docente.categoria}</td>
                  <td className="px-5 py-4 text-[var(--muted)]">{docente.condicion}</td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/director/docentes/${docente.teacherCode}`}
                      className="inline-flex rounded-md border border-[rgba(201,168,93,0.35)] bg-[rgba(201,168,93,0.08)] px-3 py-2 text-xs font-semibold text-[var(--gold-soft)] transition hover:border-[var(--gold)]"
                    >
                      Ver perfil
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
