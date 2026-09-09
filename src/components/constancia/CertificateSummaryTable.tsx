"use client";

import Link from "next/link";
import { useState } from "react";

import { descargarPdfConstancia } from "@/services/constancia/constanciaService";
import type {
  CertificateGenerationSummary,
  EstadoConstancia,
} from "@/types/constancia/constancia.types";
import { formatDateTimeInLima } from "@/utils/dates";

type CertificateSummaryTableProps = {
  certificates: CertificateGenerationSummary[];
  detailReturnTo?: string;
  emptyMessage?: string;
  showTeacherCode?: boolean;
};

export function CertificateSummaryTable({
  certificates,
  detailReturnTo,
  emptyMessage = "Aun no tienes constancias generadas.",
  showTeacherCode = false,
}: CertificateSummaryTableProps) {
  if (certificates.length === 0) {
    return (
      <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6">
        <p className="text-sm text-[var(--muted)]">{emptyMessage}</p>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-[0_18px_45px_rgba(0,0,0,0.18)]">
      <div className="border-b border-[var(--border)] px-5 py-4">
        <h3 className="text-lg font-semibold text-[var(--text)]">Listado de constancias</h3>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Consulta los registros disponibles y su historial.
        </p>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[980px] table-fixed border-collapse text-left text-sm">
          <colgroup>
            <col className={showTeacherCode ? "w-[8%]" : "w-[9%]"} />
            {showTeacherCode ? <col className="w-[11%]" /> : null}
            <col className={showTeacherCode ? "w-[17%]" : "w-[22%]"} />
            <col className={showTeacherCode ? "w-[8%]" : "w-[9%]"} />
            <col className={showTeacherCode ? "w-[9%]" : "w-[10%]"} />
            <col className={showTeacherCode ? "w-[11%]" : "w-[12%]"} />
            <col className={showTeacherCode ? "w-[8%]" : "w-[9%]"} />
            <col className={showTeacherCode ? "w-[13%]" : "w-[14%]"} />
            <col className="w-[15%]" />
          </colgroup>
          <thead className="bg-[var(--surface-soft)] text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
            <tr>
              <th className="px-4 py-3 font-semibold">Tipo</th>
              {showTeacherCode ? <th className="px-4 py-3 font-semibold">Codigo docente</th> : null}
              <th className="px-4 py-3 font-semibold">Curso</th>
              <th className="px-4 py-3 font-semibold">Seccion</th>
              <th className="px-4 py-3 font-semibold">Semestre</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
              <th className="px-4 py-3 font-semibold">Version</th>
              <th className="px-4 py-3 font-semibold">Fecha</th>
              <th className="px-4 py-3 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-soft)]">
            {certificates.map((certificate) => (
              <tr className="align-middle transition hover:bg-[rgba(90,15,36,0.28)]" key={certificate.generationId}>
                <td className="px-4 py-4 font-medium text-[var(--text)]">{certificate.type}</td>
                {showTeacherCode ? (
                  <td className="px-4 py-4 text-[var(--muted)]">{certificate.teacherCode}</td>
                ) : null}
                <td className="break-words px-4 py-4 font-medium text-[var(--text)]">
                  {certificate.courseCode ?? "Consolidacion semestral"}
                </td>
                <td className="px-4 py-4 text-[var(--muted)]">
                  {certificate.section ?? "No aplica"}
                </td>
                <td className="px-4 py-4 text-[var(--muted)]">{certificate.semester}</td>
                <td className="px-4 py-4">
                  <CertificateStatusBadge status={certificate.status} />
                </td>
                <td className="px-4 py-4 text-[var(--muted)]">
                  v{String(certificate.version).padStart(3, "0")}
                </td>
                <td className="px-4 py-4 text-[var(--muted)]">
                  {formatDateTimeInLima(certificate.generatedAt)}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    <Link
                      className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-md border border-[var(--border)] px-3 py-2 text-center text-xs font-semibold text-[var(--text)] transition hover:border-[var(--gold)] hover:text-[var(--gold-soft)]"
                      href={buildDetailHref(certificate.generationId, detailReturnTo)}
                    >
                      Ver detalle
                    </Link>
                    {certificate.pdfAvailable === false ? <span className="text-xs">PDF no disponible</span> : <DownloadPdfButton generationId={certificate.generationId} />}
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

function DownloadPdfButton({ generationId }: { generationId: string }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleDownload() {
    if (isDownloading) {
      return;
    }

    try {
      setIsDownloading(true);
      setErrorMessage(null);
      const blob = await descargarPdfConstancia(generationId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${generationId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo descargar.");
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <span className="inline-flex flex-col gap-1">
      <button
        className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-md bg-[var(--gold)] px-3 py-2 text-center text-xs font-semibold text-[#15130c] transition hover:bg-[var(--gold-soft)] disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isDownloading}
        onClick={handleDownload}
        type="button"
      >
        {isDownloading ? "Descargando..." : "Descargar"}
      </button>
      {errorMessage !== null ? (
        <span className="max-w-32 whitespace-normal text-[11px] text-red-100" role="alert">
          {errorMessage}
        </span>
      ) : null}
    </span>
  );
}

function buildDetailHref(generationId: string, detailReturnTo?: string): string {
  const href = `/constancias/${encodeURIComponent(generationId)}`;

  if (detailReturnTo === undefined || detailReturnTo.trim() === "") {
    return href;
  }

  const params = new URLSearchParams({ returnTo: detailReturnTo.trim() });
  return `${href}?${params.toString()}`;
}

function CertificateStatusBadge({ status }: { status: EstadoConstancia }) {
  const className =
    (status === "APROBADO" || status === "VERIFICADO")
      ? "border-[rgba(79,155,97,0.55)] bg-[rgba(79,155,97,0.16)] text-[#b8f0c4]"
      : "border-[rgba(201,168,93,0.55)] bg-[rgba(201,168,93,0.14)] text-[var(--gold-soft)]";
  const label = status.replaceAll("_", " ");

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${className}`}>
      {label}
    </span>
  );
}
