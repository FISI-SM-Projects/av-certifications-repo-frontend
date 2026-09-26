"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { TeacherProfileView } from "@/components/docente/TeacherProfileView";
import { useAuth } from "@/context/auth/AuthProvider";
import { listarConstanciasDocente } from "@/services/constancia/constanciaService";
import { getAuthenticatedTeacherCourses } from "@/services/docente/academicWorkloadService";

type SummaryCardProps = {
  label: string;
  value: number | null;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
};

function SummaryCard({
  label,
  value,
  isLoading,
  error,
  onRetry,
}: SummaryCardProps) {
  return (
    <article
      aria-live="polite"
      className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5"
    >
      <h3 className="text-sm font-semibold text-[var(--muted)]">{label}</h3>

      {isLoading ? (
        <p className="mt-3 text-sm text-[var(--muted)]">Cargando...</p>
      ) : error ? (
        <div className="mt-3 space-y-3">
          <p className="text-2xl font-semibold text-[var(--text)]">No disponible</p>
          <p className="text-sm text-[var(--muted)]">{error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="rounded-md border border-[var(--border)] px-3 py-2 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--gold)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gold)]"
          >
            Reintentar
          </button>
        </div>
      ) : (
        <p className="mt-3 text-3xl font-semibold text-[var(--text)]">{value}</p>
      )}
    </article>
  );
}

function AuthenticatedTeacherHome() {
  const [courseCount, setCourseCount] = useState<number | null>(null);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState<string | null>(null);
  const [coursesRetry, setCoursesRetry] = useState(0);
  const [certificateCount, setCertificateCount] = useState<number | null>(null);
  const [certificatesLoading, setCertificatesLoading] = useState(true);
  const [certificatesError, setCertificatesError] = useState<string | null>(null);
  const [certificatesRetry, setCertificatesRetry] = useState(0);

  useEffect(() => {
    let isActive = true;
    const controller = new AbortController();

    void getAuthenticatedTeacherCourses(
      { page: 0, size: 1 },
      controller.signal,
    )
      .then((response) => {
        if (isActive) {
          setCourseCount(response.pagination.totalElements);
        }
      })
      .catch(() => {
        if (isActive) {
          setCoursesError("No se pudo cargar el resumen de carga académica.");
        }
      })
      .finally(() => {
        if (isActive) {
          setCoursesLoading(false);
        }
      });

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [coursesRetry]);

  useEffect(() => {
    let isActive = true;

    void listarConstanciasDocente()
      .then((certificates) => {
        if (isActive) {
          setCertificateCount(certificates.length);
        }
      })
      .catch(() => {
        if (isActive) {
          setCertificatesError("No se pudieron cargar las constancias.");
        }
      })
      .finally(() => {
        if (isActive) {
          setCertificatesLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [certificatesRetry]);

  function retryCourses() {
    setCoursesLoading(true);
    setCoursesError(null);
    setCoursesRetry((retry) => retry + 1);
  }

  function retryCertificates() {
    setCertificatesLoading(true);
    setCertificatesError(null);
    setCertificatesRetry((retry) => retry + 1);
  }

  return (
    <div className="space-y-8">
      <section aria-labelledby="teacher-home-summary">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--gold-soft)]">
          Resumen
        </p>
        <h2
          id="teacher-home-summary"
          className="mt-2 text-2xl font-semibold text-[var(--text)]"
        >
          Tu actividad
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
          Consulta el estado general de tu carga académica y tus constancias.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <SummaryCard
            label="Cursos asignados"
            value={courseCount}
            isLoading={coursesLoading}
            error={coursesError}
            onRetry={retryCourses}
          />
          <SummaryCard
            label="Constancias generadas"
            value={certificateCount}
            isLoading={certificatesLoading}
            error={certificatesError}
            onRetry={retryCertificates}
          />
        </div>
      </section>

      <section aria-labelledby="teacher-home-actions">
        <h2
          id="teacher-home-actions"
          className="text-lg font-semibold text-[var(--text)]"
        >
          Accesos principales
        </h2>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <article className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
            <h3 className="text-base font-semibold text-[var(--text)]">
              Carga académica
            </h3>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Consulta los cursos que tienes asignados.
            </p>
            <Link
              href="/carga-academica"
              className="mt-5 inline-flex rounded-md bg-[var(--gold)] px-4 py-2 text-sm font-semibold text-[#15130c] transition hover:bg-[var(--gold-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gold)]"
            >
              Ver carga académica
            </Link>
          </article>

          <article className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
            <h3 className="text-base font-semibold text-[var(--text)]">
              Mis constancias
            </h3>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Genera, consulta y descarga tus constancias.
            </p>
            <Link
              href="/constancias"
              className="control-focus mt-5 inline-flex rounded-md border border-[var(--control-border)] px-4 py-2 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--gold)]"
            >
              Ir a mis constancias
            </Link>
          </article>
        </div>
      </section>
    </div>
  );
}

export function TeacherHomeView() {
  const { teacher, isLoading } = useAuth();

  if (isLoading) {
    return (
      <p role="status" className="text-sm text-[var(--muted)]">
        Cargando inicio...
      </p>
    );
  }

  if (teacher === null) {
    return <TeacherProfileView />;
  }

  return <AuthenticatedTeacherHome />;
}
