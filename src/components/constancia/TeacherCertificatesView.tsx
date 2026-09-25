"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import { CertificateSummaryTable } from "@/components/constancia/CertificateSummaryTable";
import { CourseCertificateForm } from "@/components/constancia/CourseCertificateForm";
import { SemesterCertificateForm } from "@/components/constancia/SemesterCertificateForm";
import { listarConstanciasDocente } from "@/services/constancia/constanciaService";
import { ConstanciaApiError } from "@/types/constancia/constancia-error.types";
import type { CertificateGenerationSummary } from "@/types/constancia/constancia.types";

type SummaryItem = {
  label: string;
  value: number | string;
};

export function TeacherCertificatesView() {
  const [certificates, setCertificates] = useState<CertificateGenerationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCourseFormOpen, setIsCourseFormOpen] = useState(false);

  const loadCertificates = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await listarConstanciasDocente();
      setCertificates(data);
    } catch (error) {
      if (error instanceof ConstanciaApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("No se pudieron cargar las constancias. Inténtalo nuevamente.");
      }
      setCertificates([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void loadCertificates();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [loadCertificates]);

  const summary = useMemo(() => buildSummary(certificates), [certificates]);

  return (
    <section className="space-y-5">
      <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.18)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <h2 className="mt-1 text-2xl font-semibold text-[var(--text)]">Mis constancias</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Consulta, visualiza y descarga tus constancias.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
            <button
              className="control-focus min-h-10 rounded-md bg-[var(--gold)] px-4 py-2 text-sm font-semibold text-[#15130c] transition hover:bg-[var(--gold-soft)]"
              onClick={() => setIsCourseFormOpen(true)}
              type="button"
            >
              Generar por curso
            </button>
            <button
              className="control-focus min-h-10 rounded-md border border-[var(--control-border)] px-4 py-2 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--gold)] hover:text-[var(--gold-soft)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-[var(--control-border)] disabled:hover:text-[var(--text)]"
              disabled={isLoading}
              onClick={loadCertificates}
              type="button"
            >
              {isLoading ? "Actualizando..." : "Actualizar"}
            </button>
          </div>
        </div>
      </section>

      {isCourseFormOpen ? (
        <CourseCertificateForm
          onCancel={() => setIsCourseFormOpen(false)}
          onGenerated={loadCertificates}
        />
      ) : null}

      <SemesterCertificateForm
        certificates={certificates}
        certificatesError={errorMessage}
        certificatesLoading={isLoading}
        onGenerated={loadCertificates}
        onRetryCertificates={loadCertificates}
      />

      {isLoading ? <PanelMessage message="Cargando constancias..." /> : null}

      {!isLoading && errorMessage !== null ? (
        <PanelMessage
          eyebrow="Consulta no disponible"
          title="No se pudo cargar el listado de constancias"
          message={errorMessage}
          action={
            <button
              className="control-focus min-h-10 rounded-md bg-[var(--gold)] px-4 py-2 text-sm font-semibold text-[#15130c] transition hover:bg-[var(--gold-soft)]"
              onClick={loadCertificates}
              type="button"
            >
              Reintentar
            </button>
          }
        />
      ) : null}

      {!isLoading && errorMessage === null && certificates.length === 0 ? (
        <PanelMessage
          eyebrow="Sin constancias"
          title="Aún no tienes constancias generadas."
          message="Las constancias aparecerán aquí cuando estén disponibles para tu perfil."
        />
      ) : null}

      {!isLoading && errorMessage === null && certificates.length > 0 ? (
        <>
          <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_14px_36px_rgba(0,0,0,0.14)]">
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--gold-soft)]">
                Resumen de constancias
              </p>
              <h3 className="mt-1 text-lg font-semibold text-[var(--text)]">
                Constancias disponibles
              </h3>
            </div>
            <SummaryGrid items={summary} />
          </section>
          <CertificateSummaryTable certificates={certificates} />
        </>
      ) : null}
    </section>
  );
}

function buildSummary(certificates: CertificateGenerationSummary[]): SummaryItem[] {
  const periodos = new Set(certificates.map((certificate) => certificate.semester));
  const latestSemester = certificates[0]?.semester ?? "Sin semestre";

  return [
    { label: "Constancias", value: certificates.length },
    {
      label: "Generadas",
      value: certificates.filter((certificate) => certificate.status === "GENERADO").length,
    },
    {
      label: "Aprobadas",
      value: certificates.filter((certificate) => certificate.status === "APROBADO").length,
    },
    { label: "Períodos", value: periodos.size },
    { label: "Semestre", value: latestSemester },
  ];
}

function SummaryGrid({ items }: { items: SummaryItem[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {items.map((item) => (
        <article
          className="rounded-md border border-[var(--border-soft)] bg-[var(--surface-soft)] p-4"
          key={item.label}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
            {item.label}
          </p>
          <p className="mt-3 break-words text-2xl font-semibold text-[var(--gold-soft)]">{item.value}</p>
        </article>
      ))}
    </div>
  );
}

function PanelMessage({
  eyebrow,
  title,
  message,
  action,
}: {
  eyebrow?: string;
  title?: string;
  message: string;
  action?: ReactNode;
}) {
  return (
    <section
      aria-live="polite"
      className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_18px_45px_rgba(0,0,0,0.18)]"
      role={title ? "alert" : "status"}
    >
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--gold-soft)]">
          {eyebrow}
        </p>
      ) : null}
      {title ? <h2 className="mt-3 text-2xl font-semibold text-[var(--text)]">{title}</h2> : null}
      <p className={title ? "mt-2 text-sm leading-6 text-[var(--muted)]" : "text-sm text-[var(--muted)]"}>
        {message}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </section>
  );
}
