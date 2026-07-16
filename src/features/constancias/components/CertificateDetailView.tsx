"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "@/features/auth/context/AuthProvider";
import {
  construirUrlDescargaPdf,
  construirUrlVisualizacionPdf,
  obtenerConstanciaPorGeneracion,
} from "@/features/constancias/services/constanciaService";
import { ConstanciaApiError } from "@/features/constancias/types/constancia-error.types";
import type {
  CertificateGenerationDetail,
  EstadoConstancia,
} from "@/features/constancias/types/constancia.types";

type CertificateDetailViewProps = {
  generationId: string;
  returnTo?: string;
};

type DetailItem = {
  label: string;
  value: string;
};

export function CertificateDetailView({ generationId, returnTo }: CertificateDetailViewProps) {
  const { user } = useAuth();
  const normalizedGenerationId = generationId.trim();
  const [certificate, setCertificate] = useState<CertificateGenerationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const backLink = useMemo(() => buildBackLink(returnTo, user?.role), [returnTo, user?.role]);

  const loadCertificate = useCallback(async () => {
    if (normalizedGenerationId === "") {
      setCertificate(null);
      setErrorMessage("El identificador de generación es obligatorio.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await obtenerConstanciaPorGeneracion(normalizedGenerationId);
      setCertificate(data);
    } catch (error) {
      if (error instanceof ConstanciaApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("No se pudo conectar con el backend de constancias.");
      }
      setCertificate(null);
    } finally {
      setIsLoading(false);
    }
  }, [normalizedGenerationId]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void loadCertificate();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [loadCertificate]);

  const pdfUrl = useMemo(
    () => (certificate ? construirUrlVisualizacionPdf(certificate.generationId) : null),
    [certificate],
  );
  const downloadUrl = useMemo(
    () => (certificate ? construirUrlDescargaPdf(certificate.generationId) : null),
    [certificate],
  );
  const detailItems = useMemo(
    () => (certificate ? buildDetailItems(certificate) : []),
    [certificate],
  );

  if (isLoading) {
    return <PanelMessage message="Cargando constancia..." />;
  }

  if (errorMessage !== null) {
    return (
      <PanelMessage
        action={
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              className="rounded-md bg-[var(--gold)] px-4 py-2 text-sm font-semibold text-[#15130c] transition hover:bg-[var(--gold-soft)]"
              onClick={loadCertificate}
              type="button"
            >
              Reintentar
            </button>
            <BackLink href={backLink.href} label={backLink.label} />
          </div>
        }
        eyebrow="Detalle no disponible"
        message={errorMessage}
        title="No se pudo cargar la constancia"
      />
    );
  }

  if (certificate === null || pdfUrl === null || downloadUrl === null) {
    return (
      <PanelMessage
        action={<BackLink href={backLink.href} label={backLink.label} />}
        eyebrow="Sin datos"
        message="No hay metadata disponible para esta constancia."
        title="Constancia no encontrada"
      />
    );
  }

  return (
    <section className="space-y-5">
      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.18)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--gold-soft)]">
              Documento generado
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--text)]">
              Constancia {certificate.type}
            </h2>
            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
              Identificador interno:{" "}
              <span className="font-semibold text-[var(--gold-soft)]">
                {certificate.generationId}
              </span>
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <BackLink href={backLink.href} label={backLink.label} />
            <a
              className="rounded-md bg-[var(--gold)] px-4 py-2 text-center text-sm font-semibold text-[#15130c] transition hover:bg-[var(--gold-soft)]"
              download
              href={downloadUrl}
            >
              Descargar PDF
            </a>
          </div>
        </div>
      </div>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)]">
        <article className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.18)]">
          <div className="flex items-center justify-between gap-3 border-b border-[var(--border-soft)] pb-4">
            <h3 className="text-lg font-semibold text-[var(--text)]">Metadata pública</h3>
            <CertificateStatusBadge status={certificate.status} />
          </div>

          <dl className="mt-4 space-y-3">
            {detailItems.map((item) => (
              <div
                className="rounded-md border border-[var(--border-soft)] bg-[var(--surface-soft)] p-3"
                key={item.label}
              >
                <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                  {item.label}
                </dt>
                <dd className="mt-1 break-words text-sm font-medium text-[var(--text)]">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </article>

        <article className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.18)]">
          <div className="flex flex-col gap-3 border-b border-[var(--border-soft)] pb-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[var(--text)]">Vista previa PDF</h3>
              <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                Si la vista previa no carga, el documento puede no estar disponible o el
                navegador puede bloquear el visor integrado.
              </p>
            </div>
            <a
              className="rounded-md border border-[var(--border)] px-4 py-2 text-center text-sm font-semibold text-[var(--text)] transition hover:border-[var(--gold)] hover:text-[var(--gold-soft)]"
              href={pdfUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              Abrir PDF en nueva pestaña
            </a>
          </div>

          <div className="mt-4 overflow-hidden rounded-lg border border-[var(--border-soft)] bg-[#111]">
            <iframe
              className="h-[70vh] min-h-[520px] w-full"
              src={pdfUrl}
              title={`Vista previa de ${certificate.generationId}`}
            />
          </div>
        </article>
      </section>
    </section>
  );
}

function buildDetailItems(certificate: CertificateGenerationDetail): DetailItem[] {
  return [
    { label: "Tipo", value: certificate.type },
    { label: "Estado", value: certificate.status },
    { label: "Versión", value: `v${String(certificate.version).padStart(3, "0")}` },
    { label: "Código docente", value: certificate.teacherCode },
    { label: "Código de curso", value: certificate.courseCode ?? "Constancia semestral" },
    { label: "Sección", value: certificate.section ?? "No aplica" },
    { label: "Semestre", value: certificate.semester },
    { label: "Fecha de generación", value: formatGeneratedAt(certificate.generatedAt) },
    { label: "Generation ID", value: certificate.generationId },
    { label: "Certificate key", value: certificate.certificateKey },
  ];
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

type BackLinkConfig = {
  href: string;
  label: string;
};

function BackLink({ href, label }: BackLinkConfig) {
  return (
    <Link
      className="rounded-md border border-[var(--border)] px-4 py-2 text-center text-sm font-semibold text-[var(--text)] transition hover:border-[var(--gold)] hover:text-[var(--gold-soft)]"
      href={href}
    >
      {label}
    </Link>
  );
}

function buildBackLink(returnTo: string | undefined, role: string | undefined): BackLinkConfig {
  const validatedReturnTo = validateReturnTo(returnTo);

  if (validatedReturnTo === "/constancias") {
    return { href: validatedReturnTo, label: "Volver a mis constancias" };
  }

  if (validatedReturnTo === "/perfil-docente") {
    return { href: validatedReturnTo, label: "Volver al perfil docente" };
  }

  if (validatedReturnTo?.startsWith("/director/docentes/")) {
    return { href: validatedReturnTo, label: "Volver al perfil del docente" };
  }

  if (role === "DIRECTOR") {
    return { href: "/director/docentes", label: "Volver al listado de docentes" };
  }

  return { href: "/constancias", label: "Volver a mis constancias" };
}

function validateReturnTo(returnTo: string | undefined): string | null {
  if (returnTo === undefined) {
    return null;
  }

  const candidate = returnTo.trim();
  const lowerCandidate = candidate.toLowerCase();

  if (
    candidate === "" ||
    !candidate.startsWith("/") ||
    candidate.startsWith("//") ||
    candidate.includes("\\") ||
    candidate.includes("..") ||
    lowerCandidate.startsWith("http://") ||
    lowerCandidate.startsWith("https://") ||
    lowerCandidate.startsWith("javascript:") ||
    lowerCandidate.includes("%2e") ||
    lowerCandidate.includes("%2f") ||
    lowerCandidate.includes("%5c")
  ) {
    return null;
  }

  if (candidate === "/constancias" || candidate === "/perfil-docente") {
    return candidate;
  }

  if (/^\/director\/docentes\/[^/?#\\]+$/.test(candidate)) {
    return candidate;
  }

  return null;
}

function PanelMessage({
  action,
  eyebrow,
  message,
  title,
}: {
  action?: React.ReactNode;
  eyebrow?: string;
  message: string;
  title?: string;
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

function formatGeneratedAt(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Fecha no disponible";
  }

  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
