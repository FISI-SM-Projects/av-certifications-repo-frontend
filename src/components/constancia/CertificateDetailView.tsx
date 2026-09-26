"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { CertificateDownloadButton } from "@/components/constancia/CertificateDownloadButton";
import { useAuth } from "@/context/auth/AuthProvider";
import {
  obtenerPdfConstancia,
  obtenerConstanciaPorGeneracion,
  type CertificateAccessScope,
} from "@/services/constancia/constanciaService";
import { ConstanciaApiError } from "@/types/constancia/constancia-error.types";
import type {
  CertificateGenerationDetail,
  EstadoConstancia,
} from "@/types/constancia/constancia.types";
import { formatDateTimeInLima } from "@/utils/dates";

type CertificateDetailViewProps = {
  generationId: string;
  returnTo?: string;
};

type DetailItem = {
  label: string;
  value: string;
};

const PDF_PREVIEW_HEIGHT =
  "h-[46vh] min-h-[320px] sm:h-[55vh] sm:min-h-[400px] lg:h-[70vh] lg:min-h-[520px]";

export function CertificateDetailView({ generationId, returnTo }: CertificateDetailViewProps) {
  const { roles } = useAuth();
  const normalizedGenerationId = generationId.trim();
  const accessScope: CertificateAccessScope = roles.includes("DOCENTE")
    ? "self"
    : "administrative";
  const [certificate, setCertificate] = useState<CertificateGenerationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const backLink = useMemo(
    () => buildBackLink(returnTo, roles.includes("DIRECTOR_ESCUELA")),
    [returnTo, roles],
  );

  const loadCertificate = useCallback(async () => {
    if (normalizedGenerationId === "") {
      setCertificate(null);
      setErrorMessage("El identificador de generación es obligatorio.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await obtenerConstanciaPorGeneracion(normalizedGenerationId, accessScope);
      setCertificate(data);
    } catch (error) {
      if (error instanceof ConstanciaApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("No se pudo cargar la constancia. Inténtalo nuevamente.");
      }
      setCertificate(null);
    } finally {
      setIsLoading(false);
    }
  }, [accessScope, normalizedGenerationId]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void loadCertificate();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [loadCertificate]);

  useEffect(() => {
    if (certificate === null) {
      return undefined;
    }

    let objectUrl: string | null = null;
    let isActive = true;
    const timeoutId = setTimeout(() => {
      setIsPdfLoading(true);
      setPdfError(null);

      void obtenerPdfConstancia(certificate.generationId, accessScope)
        .then((blob) => {
          if (!isActive) {
            return;
          }
          objectUrl = URL.createObjectURL(blob);
          setPdfUrl(objectUrl);
        })
        .catch(() => {
          if (isActive) {
            setPdfError("No se pudo cargar la vista previa del PDF.");
            setPdfUrl(null);
          }
        })
        .finally(() => {
          if (isActive) {
            setIsPdfLoading(false);
          }
        });
    }, 0);

    return () => {
      isActive = false;
      clearTimeout(timeoutId);
      if (objectUrl !== null) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [accessScope, certificate]);

  const detailItems = useMemo(
    () => (certificate ? buildDetailItems(certificate, accessScope) : []),
    [accessScope, certificate],
  );

  if (isLoading) {
    return <PanelMessage message="Cargando constancia..." role="status" />;
  }

  if (errorMessage !== null) {
    return (
      <PanelMessage
        action={
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              className="control-focus rounded-md bg-[var(--gold)] px-4 py-2 text-sm font-semibold text-[#15130c] transition hover:bg-[var(--gold-soft)]"
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
        role="alert"
        title="No se pudo cargar la constancia"
      />
    );
  }

  if (certificate === null) {
    return (
      <PanelMessage
        action={<BackLink href={backLink.href} label={backLink.label} />}
        eyebrow="Sin datos"
        message="No hay información disponible para esta constancia."
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
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-semibold text-[var(--text)]">
                {certificate.type === "CURSO" ? "Constancia por curso" : "Constancia semestral"}
              </h2>
              <CertificateStatusBadge status={certificate.status} />
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <BackLink href={backLink.href} label={backLink.label} />
            <CertificateDownloadButton
              className="min-h-11 w-full rounded-md bg-[var(--gold)] px-4 py-2 text-center text-sm font-semibold text-[#15130c] transition hover:bg-[var(--gold-soft)] sm:w-auto"
              generationId={certificate.generationId}
              label="Descargar PDF"
              scope={accessScope}
            />
          </div>
        </div>
      </div>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)]">
        <article className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.18)]">
          <div className="border-b border-[var(--border-soft)] pb-4">
            <h3 className="text-lg font-semibold text-[var(--text)]">Información de la constancia</h3>
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

        <article className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.18)]">
          <div className="flex flex-col gap-3 border-b border-[var(--border-soft)] pb-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[var(--text)]">Vista previa del PDF</h3>
              <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                Ábrelo en una pestaña nueva para verlo con más espacio y usar los controles del
                navegador.
              </p>
            </div>
            {pdfUrl ? (
              <a
                className="control-focus inline-flex min-h-11 items-center justify-center rounded-md border border-[var(--control-border)] px-4 py-2 text-center text-sm font-semibold text-[var(--text)] transition hover:border-[var(--gold)] hover:text-[var(--gold-soft)]"
                href={pdfUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                Abrir PDF en nueva pestaña
              </a>
            ) : null}
          </div>

          <div className="mt-4 min-w-0 overflow-hidden rounded-lg border border-[var(--border-soft)] bg-[#111]">
            {isPdfLoading ? (
              <p
                className={`${PDF_PREVIEW_HEIGHT} flex items-center justify-center p-6 text-sm text-[var(--muted)]`}
                role="status"
              >
                Cargando vista previa...
              </p>
            ) : null}
            {pdfError ? (
              <p className="p-6 text-sm text-[#f0b8b8]" role="alert">
                {pdfError}
              </p>
            ) : null}
            {pdfUrl ? (
              <iframe
                className={`${PDF_PREVIEW_HEIGHT} w-full`}
                src={pdfUrl}
                title={`Vista previa de ${certificate.generationId}`}
              />
            ) : null}
          </div>
        </article>
      </section>
    </section>
  );
}

function buildDetailItems(
  certificate: CertificateGenerationDetail,
  accessScope: CertificateAccessScope,
): DetailItem[] {
  const items: DetailItem[] = [];

  if (accessScope === "administrative") {
    items.push({ label: "Código docente", value: certificate.teacherCode });
  }

  if (certificate.type === "CURSO") {
    if (certificate.courseCode !== null) {
      items.push({ label: "Código de curso", value: certificate.courseCode });
    }

    if (certificate.section !== null) {
      items.push({ label: "Sección", value: certificate.section });
    }
  }

  items.push(
    { label: "Período", value: certificate.semester },
    { label: "Fecha de generación", value: formatDateTimeInLima(certificate.generatedAt) },
    { label: "Versión", value: `v${String(certificate.version).padStart(3, "0")}` },
  );

  return items;
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
      className="control-focus inline-flex min-h-11 items-center justify-center rounded-md border border-[var(--control-border)] px-4 py-2 text-center text-sm font-semibold text-[var(--text)] transition hover:border-[var(--gold)] hover:text-[var(--gold-soft)]"
      href={href}
    >
      {label}
    </Link>
  );
}

function buildBackLink(returnTo: string | undefined, isDirector: boolean): BackLinkConfig {
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

  if (isDirector) {
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
  role,
  title,
}: {
  action?: React.ReactNode;
  eyebrow?: string;
  message: string;
  role?: "alert" | "status";
  title?: string;
}) {
  return (
    <section
      className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_18px_45px_rgba(0,0,0,0.18)]"
      role={role}
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
