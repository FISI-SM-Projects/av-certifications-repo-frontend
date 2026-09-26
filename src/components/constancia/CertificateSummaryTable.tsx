"use client";

import Link from "next/link";

import { CertificateDownloadButton } from "@/components/constancia/CertificateDownloadButton";
import type { CertificateAccessScope } from "@/services/constancia/constanciaService";
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
  accessScope?: CertificateAccessScope;
};

export function CertificateSummaryTable({
  certificates,
  detailReturnTo,
  emptyMessage = "Aún no tienes constancias generadas.",
  showTeacherCode = false,
  accessScope = "self",
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
          Se muestra la versión más reciente de cada constancia.
        </p>
      </div>

      <div className="divide-y divide-[var(--border-soft)] md:hidden" data-testid="mobile-certificate-list">
        {certificates.map((certificate) => (
          <MobileCertificateCard
            accessScope={accessScope}
            certificate={certificate}
            detailReturnTo={detailReturnTo}
            key={certificate.generationId}
            showTeacherCode={showTeacherCode}
          />
        ))}
      </div>

      <div className="hidden w-full overflow-x-auto md:block" data-testid="desktop-certificate-table">
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
              {showTeacherCode ? <th className="px-4 py-3 font-semibold">Código docente</th> : null}
              <th className="px-4 py-3 font-semibold">Curso</th>
              <th className="px-4 py-3 font-semibold">Sección</th>
              <th className="px-4 py-3 font-semibold">Semestre</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
              <th className="px-4 py-3 font-semibold">Versión</th>
              <th className="px-4 py-3 font-semibold">Fecha</th>
              <th className="px-4 py-3 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-soft)]">
            {certificates.map((certificate) => (
              <tr className="align-middle transition hover:bg-[rgba(90,15,36,0.28)]" key={certificate.generationId}>
                <td className="px-4 py-4 font-medium text-[var(--text)]">
                  {certificate.type === "CURSO" ? "Por curso" : "Semestral"}
                </td>
                {showTeacherCode ? (
                  <td className="px-4 py-4 text-[var(--muted)]">{certificate.teacherCode}</td>
                ) : null}
                <td className="break-words px-4 py-4 font-medium text-[var(--text)]">
                  {certificate.courseCode ?? "Constancia semestral"}
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
                  <CertificateActions
                    accessScope={accessScope}
                    detailReturnTo={detailReturnTo}
                    generationId={certificate.generationId}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function MobileCertificateCard({
  accessScope,
  certificate,
  detailReturnTo,
  showTeacherCode,
}: {
  accessScope: CertificateAccessScope;
  certificate: CertificateGenerationSummary;
  detailReturnTo?: string;
  showTeacherCode: boolean;
}) {
  const isCourseCertificate = certificate.type === "CURSO";
  const title = isCourseCertificate
    ? certificate.courseCode ?? "Constancia por curso"
    : `Período ${certificate.semester}`;

  return (
    <article className="min-w-0 space-y-4 p-5">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--gold-soft)]">
            {isCourseCertificate ? "Constancia por curso" : "Constancia semestral"}
          </p>
          <h4 className="mt-2 break-words text-lg font-semibold text-[var(--text)]">
            {title}
          </h4>
          {isCourseCertificate ? (
            <p className="mt-1 text-sm text-[var(--muted)]">
              Período {certificate.semester}
              {certificate.section ? ` · Sección ${certificate.section}` : ""}
            </p>
          ) : null}
        </div>
        <CertificateStatusBadge status={certificate.status} />
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
        {showTeacherCode ? (
          <CertificateMetadata label="Código docente" value={certificate.teacherCode} />
        ) : null}
        <CertificateMetadata
          label="Versión"
          value={`v${String(certificate.version).padStart(3, "0")}`}
        />
        <CertificateMetadata label="Fecha" value={formatDateTimeInLima(certificate.generatedAt)} />
      </dl>

      <CertificateActions
        accessScope={accessScope}
        detailReturnTo={detailReturnTo}
        generationId={certificate.generationId}
        mobile
      />
    </article>
  );
}

function CertificateMetadata({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium text-[var(--muted)]">{label}</dt>
      <dd className="mt-1 break-words font-semibold text-[var(--text)]">{value}</dd>
    </div>
  );
}

function CertificateActions({
  accessScope,
  detailReturnTo,
  generationId,
  mobile = false,
}: {
  accessScope: CertificateAccessScope;
  detailReturnTo?: string;
  generationId: string;
  mobile?: boolean;
}) {
  const containerClassName = mobile
    ? "grid grid-cols-1 gap-2 sm:grid-cols-2"
    : "flex items-center gap-2 whitespace-nowrap";
  const actionClassName = mobile ? "w-full" : "shrink-0";

  return (
    <div className={containerClassName}>
      <Link
        className={`control-focus inline-flex min-h-10 items-center justify-center rounded-md border border-[var(--control-border)] px-3 py-2 text-center text-xs font-semibold text-[var(--text)] transition hover:border-[var(--gold)] hover:text-[var(--gold-soft)] ${actionClassName}`}
        href={buildDetailHref(generationId, detailReturnTo)}
      >
        Ver detalle
      </Link>
      <CertificateDownloadButton
        className={`inline-flex min-h-10 items-center justify-center rounded-md bg-[var(--gold)] px-3 py-2 text-center text-xs font-semibold text-[#15130c] transition hover:bg-[var(--gold-soft)] ${actionClassName}`}
        generationId={generationId}
        scope={accessScope}
      />
    </div>
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
