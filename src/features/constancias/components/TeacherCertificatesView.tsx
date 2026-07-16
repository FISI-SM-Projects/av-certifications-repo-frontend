"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import { useAuth } from "@/features/auth/context/AuthProvider";
import { CourseCertificateSimulationForm } from "@/features/constancias/components/CourseCertificateSimulationForm";
import { SemesterCertificateSimulationForm } from "@/features/constancias/components/SemesterCertificateSimulationForm";
import {
  construirUrlDescargaPdf,
  listarConstanciasDocente,
} from "@/features/constancias/services/constanciaService";
import { ConstanciaApiError } from "@/features/constancias/types/constancia-error.types";
import type {
  CertificateGenerationSummary,
  EstadoConstancia,
} from "@/features/constancias/types/constancia.types";
import { obtenerTeacherCodeDeSesion } from "@/features/constancias/utils/sessionTeacher";
import { formatDateTimeInLima } from "@/lib/dates";

type SummaryItem = {
  label: string;
  value: number;
};

export function TeacherCertificatesView() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const teacherCode = obtenerTeacherCodeDeSesion(user);
  const [certificates, setCertificates] = useState<CertificateGenerationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSimulationFormOpen, setIsSimulationFormOpen] = useState(false);

  const loadCertificates = useCallback(async () => {
    if (teacherCode === null) {
      setCertificates([]);
      setErrorMessage(null);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await listarConstanciasDocente(teacherCode);
      setCertificates(data);
    } catch (error) {
      if (error instanceof ConstanciaApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("No se pudo conectar con el backend de constancias.");
      }
      setCertificates([]);
    } finally {
      setIsLoading(false);
    }
  }, [teacherCode]);

  useEffect(() => {
    if (!isAuthLoading) {
      const timeoutId = setTimeout(() => {
        void loadCertificates();
      }, 0);

      return () => clearTimeout(timeoutId);
    }

    return undefined;
  }, [isAuthLoading, loadCertificates]);

  const summary = useMemo(() => buildSummary(certificates), [certificates]);

  if (isAuthLoading) {
    return <PanelMessage message="Verificando sesión..." />;
  }

  if (teacherCode === null || user === null) {
    return (
      <PanelMessage
        eyebrow="Sesión sin código docente"
        title="La sesión actual no tiene un código docente asociado."
        message="La consulta personal de constancias requiere un usuario con teacherCode."
      />
    );
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.18)] md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--gold-soft)]">
            Aula Virtual simulada
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-[var(--text)]">
            Constancias visibles
          </h2>
          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
            Se muestran las últimas versiones disponibles para el código docente{" "}
            <span className="font-semibold text-[var(--gold-soft)]">{teacherCode}</span>.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            className="rounded-md bg-[var(--gold)] px-4 py-2 text-sm font-semibold text-[#15130c] transition hover:bg-[var(--gold-soft)]"
            onClick={() => setIsSimulationFormOpen(true)}
            type="button"
          >
            Simular recepción desde Aula Virtual
          </button>
          <button
            className="rounded-md border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--gold)] hover:text-[var(--gold-soft)] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isLoading}
            onClick={loadCertificates}
            type="button"
          >
            {isLoading ? "Actualizando..." : "Actualizar"}
          </button>
        </div>
      </div>

      {isSimulationFormOpen ? (
        <CourseCertificateSimulationForm
          onCancel={() => setIsSimulationFormOpen(false)}
          onGenerated={loadCertificates}
          teacherCode={teacherCode}
          user={user}
        />
      ) : null}

      <SemesterCertificateSimulationForm
        certificates={certificates}
        onGenerated={loadCertificates}
        teacherCode={teacherCode}
      />

      {isLoading ? <PanelMessage message="Cargando constancias..." /> : null}

      {!isLoading && errorMessage !== null ? (
        <PanelMessage
          eyebrow="Consulta no disponible"
          title="No se pudo cargar el listado de constancias"
          message={errorMessage}
          action={
            <button
              className="rounded-md bg-[var(--gold)] px-4 py-2 text-sm font-semibold text-[#15130c] transition hover:bg-[var(--gold-soft)]"
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
          message="Las constancias aparecerán aquí cuando sean generadas desde la simulación de Aula Virtual."
        />
      ) : null}

      {!isLoading && errorMessage === null && certificates.length > 0 ? (
        <>
          <SummaryGrid items={summary} />
          <CertificatesTable certificates={certificates} />
        </>
      ) : null}
    </section>
  );
}

function buildSummary(certificates: CertificateGenerationSummary[]): SummaryItem[] {
  const periodos = new Set(certificates.map((certificate) => certificate.semester));

  return [
    { label: "Total visibles", value: certificates.length },
    {
      label: "Generadas",
      value: certificates.filter((certificate) => certificate.status === "GENERADO").length,
    },
    {
      label: "Aprobadas",
      value: certificates.filter((certificate) => certificate.status === "APROBADO").length,
    },
    { label: "Periodos", value: periodos.size },
  ];
}

function SummaryGrid({ items }: { items: SummaryItem[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <article
          className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_12px_28px_rgba(0,0,0,0.14)]"
          key={item.label}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
            {item.label}
          </p>
          <p className="mt-3 text-3xl font-semibold text-[var(--gold-soft)]">{item.value}</p>
        </article>
      ))}
    </div>
  );
}

function CertificatesTable({
  certificates,
}: {
  certificates: CertificateGenerationSummary[];
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-[0_18px_45px_rgba(0,0,0,0.18)]">
      <div className="border-b border-[var(--border)] px-5 py-4">
        <h3 className="text-lg font-semibold text-[var(--text)]">Listado de constancias</h3>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Cada registro corresponde a la última versión visible de una constancia lógica.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-[var(--surface-soft)] text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
            <tr>
              <th className="px-5 py-3 font-semibold">Tipo</th>
              <th className="px-5 py-3 font-semibold">Curso</th>
              <th className="px-5 py-3 font-semibold">Sección</th>
              <th className="px-5 py-3 font-semibold">Semestre</th>
              <th className="px-5 py-3 font-semibold">Estado</th>
              <th className="px-5 py-3 font-semibold">Versión</th>
              <th className="px-5 py-3 font-semibold">Fecha</th>
              <th className="px-5 py-3 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-soft)]">
            {certificates.map((certificate) => (
              <tr className="align-top" key={certificate.generationId}>
                <td className="px-5 py-4 font-medium text-[var(--text)]">{certificate.type}</td>
                <td className="px-5 py-4 text-[var(--text)]">
                  {certificate.courseCode ?? "Constancia semestral"}
                </td>
                <td className="px-5 py-4 text-[var(--muted)]">
                  {certificate.section ?? "No aplica"}
                </td>
                <td className="px-5 py-4 text-[var(--muted)]">{certificate.semester}</td>
                <td className="px-5 py-4">
                  <CertificateStatusBadge status={certificate.status} />
                </td>
                <td className="px-5 py-4 text-[var(--muted)]">
                  v{String(certificate.version).padStart(3, "0")}
                </td>
                <td className="px-5 py-4 text-[var(--muted)]">
                  {formatDateTimeInLima(certificate.generatedAt)}
                </td>
                <td className="px-5 py-4">
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Link
                      className="rounded-md border border-[var(--border)] px-3 py-2 text-center text-xs font-semibold text-[var(--text)] transition hover:border-[var(--gold)] hover:text-[var(--gold-soft)]"
                      href={`/constancias/${encodeURIComponent(certificate.generationId)}`}
                    >
                      Ver detalle
                    </Link>
                    <a
                      className="rounded-md bg-[var(--gold)] px-3 py-2 text-center text-xs font-semibold text-[#15130c] transition hover:bg-[var(--gold-soft)]"
                      download
                      href={construirUrlDescargaPdf(certificate.generationId)}
                    >
                      Descargar
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function CertificateStatusBadge({ status }: { status: EstadoConstancia }) {
  const className =
    status === "APROBADO"
      ? "border-[rgba(79,155,97,0.55)] bg-[rgba(79,155,97,0.16)] text-[#b8f0c4]"
      : "border-[rgba(201,168,93,0.55)] bg-[rgba(201,168,93,0.14)] text-[var(--gold-soft)]";
  const label = status === "APROBADO" ? "Aprobado" : "Generado";

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${className}`}>
      {label}
    </span>
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
    <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_18px_45px_rgba(0,0,0,0.18)]">
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
