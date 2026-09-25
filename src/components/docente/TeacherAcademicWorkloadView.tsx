"use client";

import { useEffect, useState, type ReactNode } from "react";

import { getAuthenticatedTeacherCourses } from "@/services/docente/academicWorkloadService";
import type { AcademicWorkloadResponse } from "@/types/docente/academicWorkload.types";

const PAGE_SIZE = 10;

export function TeacherAcademicWorkloadView() {
  const [page, setPage] = useState(0);
  const [retryKey, setRetryKey] = useState(0);
  const [response, setResponse] = useState<AcademicWorkloadResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    const controller = new AbortController();

    async function loadAcademicWorkload() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const nextResponse = await getAuthenticatedTeacherCourses(
          { page, size: PAGE_SIZE },
          controller.signal,
        );

        if (isActive) {
          setResponse(nextResponse);
        }
      } catch {
        if (isActive) {
          setResponse(null);
          setErrorMessage("No se pudo cargar la carga académica. Inténtalo nuevamente.");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadAcademicWorkload();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [page, retryKey]);

  if (isLoading) {
    return <StatusPanel message="Cargando carga académica..." role="status" />;
  }

  if (errorMessage !== null) {
    return (
      <StatusPanel
        action={
          <button
            className="control-focus rounded-md bg-[var(--gold)] px-4 py-2 text-sm font-semibold text-[#15130c] transition hover:bg-[var(--gold-soft)]"
            onClick={() => setRetryKey((current) => current + 1)}
            type="button"
          >
            Reintentar
          </button>
        }
        message={errorMessage}
        role="alert"
        title="Carga académica no disponible"
      />
    );
  }

  if (response === null || response.data.length === 0) {
    return <StatusPanel message="No se encontró carga académica." />;
  }

  const { pagination } = response;
  const currentPage = pagination.totalPages === 0 ? 0 : pagination.pageNumber + 1;
  const hasPreviousPage = pagination.pageNumber > 0;
  const hasNextPage =
    pagination.totalPages > 0 && pagination.pageNumber < pagination.totalPages - 1;

  return (
    <section className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-[0_14px_36px_rgba(0,0,0,0.14)]">
      <div className="border-b border-[var(--border)] px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--gold-soft)]">
          Cursos asignados
        </p>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Mostrando {pagination.numberOfElements} de {pagination.totalElements} cursos asignados.
        </p>
      </div>

      <div className="divide-y divide-[var(--border-soft)] md:hidden">
        {response.data.map((workload) => {
          const courseTitleId = `workload-course-${workload.id}`;

          return (
            <article aria-labelledby={courseTitleId} className="space-y-4 px-5 py-5" key={workload.id}>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--gold-soft)]">
                  {workload.course.code}
                </p>
                <h3 className="mt-1 text-base font-semibold leading-6 text-[var(--text)]" id={courseTitleId}>
                  {workload.course.name}
                </h3>
              </div>

              <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                <WorkloadField label="Período" value={workload.academicPeriod.semesterCode} />
                <WorkloadField label="Sección" value={workload.section} />
              </dl>

              <dl className="grid grid-cols-3 gap-3 border-t border-[var(--border-soft)] pt-3">
                <WorkloadField label="Ciclo" secondary value={workload.cycle} />
                <WorkloadField label="Plan" secondary value={workload.plan} />
                <WorkloadField label="Escuela" secondary value={workload.school} />
              </dl>
            </article>
          );
        })}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[860px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[rgba(90,15,36,0.88)] text-[var(--muted)]">
              <th className="px-5 py-3 font-semibold">Código</th>
              <th className="px-5 py-3 font-semibold">Curso</th>
              <th className="px-5 py-3 font-semibold">Período</th>
              <th className="px-5 py-3 font-semibold">Ciclo</th>
              <th className="px-5 py-3 font-semibold">Sección</th>
              <th className="px-5 py-3 font-semibold">Plan</th>
              <th className="px-5 py-3 font-semibold">Escuela</th>
            </tr>
          </thead>
          <tbody>
            {response.data.map((workload) => (
              <tr
                className="border-b border-[var(--border-soft)] transition hover:bg-[rgba(90,15,36,0.55)]"
                key={workload.id}
              >
                <td className="px-5 py-4 font-semibold text-[var(--gold-soft)]">
                  {workload.course.code}
                </td>
                <td className="px-5 py-4 text-[var(--text)]">{workload.course.name}</td>
                <td className="px-5 py-4 text-[var(--muted)]">
                  {workload.academicPeriod.semesterCode}
                </td>
                <td className="px-5 py-4 text-[var(--muted)]">{workload.cycle}</td>
                <td className="px-5 py-4 text-[var(--muted)]">{workload.section}</td>
                <td className="px-5 py-4 text-[var(--muted)]">{workload.plan}</td>
                <td className="px-5 py-4 text-[var(--muted)]">{workload.school}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-[var(--border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-center text-sm text-[var(--muted)] sm:text-left">
          Página {currentPage} de {pagination.totalPages}
        </p>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <button
            className="control-focus rounded-md border border-[var(--control-border)] px-4 py-2 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--gold)] disabled:cursor-not-allowed disabled:border-[var(--border-soft)] disabled:bg-black/20 disabled:text-[var(--muted)] disabled:opacity-60 disabled:hover:border-[var(--border-soft)]"
            disabled={!hasPreviousPage}
            onClick={() => setPage(pagination.pageNumber - 1)}
            type="button"
          >
            Anterior
          </button>
          <button
            className="control-focus rounded-md border border-[var(--control-border)] px-4 py-2 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--gold)] disabled:cursor-not-allowed disabled:border-[var(--border-soft)] disabled:bg-black/20 disabled:text-[var(--muted)] disabled:opacity-60 disabled:hover:border-[var(--border-soft)]"
            disabled={!hasNextPage}
            onClick={() => setPage(pagination.pageNumber + 1)}
            type="button"
          >
            Siguiente
          </button>
        </div>
      </div>
    </section>
  );
}

function WorkloadField({
  label,
  secondary = false,
  value,
}: {
  label: string;
  secondary?: boolean;
  value: number | string;
}) {
  return (
    <div>
      <dt className="text-xs font-medium text-[var(--muted)]">{label}</dt>
      <dd className={`mt-1 font-semibold ${secondary ? "text-sm text-[var(--muted)]" : "text-sm text-[var(--text)]"}`}>
        {value}
      </dd>
    </div>
  );
}

function StatusPanel({
  action,
  message,
  role,
  title,
}: {
  action?: ReactNode;
  message: string;
  role?: "alert" | "status";
  title?: string;
}) {
  return (
    <section
      className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_18px_45px_rgba(0,0,0,0.18)]"
      role={role}
    >
      {title ? <h2 className="text-xl font-semibold text-[var(--text)]">{title}</h2> : null}
      <p className={title ? "mt-2 text-sm text-[var(--muted)]" : "text-sm text-[var(--muted)]"}>
        {message}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </section>
  );
}
