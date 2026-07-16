"use client";

import Link from "next/link";

import { construirUrlDescargaPdf } from "@/features/constancias/services/constanciaService";
import type {
  CertificateGenerationSummary,
  EstadoConstancia,
} from "@/features/constancias/types/constancia.types";
import { formatDateTimeInLima } from "@/lib/dates";

type CertificateSummaryTableProps = {
  certificates: CertificateGenerationSummary[];
  detailReturnTo?: string;
  emptyMessage?: string;
  showTeacherCode?: boolean;
};

export function CertificateSummaryTable({
  certificates,
  detailReturnTo,
  emptyMessage = "Aún no tienes constancias generadas.",
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
          Cada registro corresponde a la última versión visible de una constancia lógica.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-[var(--surface-soft)] text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
            <tr>
              <th className="px-5 py-3 font-semibold">Tipo</th>
              {showTeacherCode ? <th className="px-5 py-3 font-semibold">Código docente</th> : null}
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
                {showTeacherCode ? (
                  <td className="px-5 py-4 text-[var(--muted)]">{certificate.teacherCode}</td>
                ) : null}
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
                      href={buildDetailHref(certificate.generationId, detailReturnTo)}
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
