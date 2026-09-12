"use client";

import { useEffect, useMemo, useState } from "react";
import { getAcademicWorkload, generateWorkloadCertificate } from "@/services/docente/workloadService";
import type { CertificateGenerationSummary } from "@/types/constancia/constancia.types";
import type { AcademicWorkload } from "@/types/docente/workload.types";
import { isSignedStatus, isUsableCertificateStatus } from "@/utils/constancia/certificateStatus";

type AcademicWorkloadTableProps = {
  teacherCode: string;
  certificates?: CertificateGenerationSummary[];
  onGenerated?: () => Promise<void>;
  onWorkloadsLoaded?: (rows: AcademicWorkload[]) => void;
};

export function AcademicWorkloadTable({ certificates = [], teacherCode, onGenerated, onWorkloadsLoaded }: AcademicWorkloadTableProps) {
  const [rows, setRows] = useState<AcademicWorkload[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const certificatesByWorkloadId = useMemo(() => {
    const byWorkloadId = new Map<number, CertificateGenerationSummary>();
    certificates
      .filter((certificate) =>
        (certificate.certificateType === "COURSE" || certificate.type === "CURSO") &&
        isUsableCertificateStatus(certificate.status),
      )
      .forEach((certificate) => {
        const match = /^workload-(\d+)$/.exec(certificate.certificateKey);
        if (match) {
          const workloadId = Number(match[1]);
          const current = byWorkloadId.get(workloadId);
          if (!current || Number(certificate.generationId) > Number(current.generationId)) {
            byWorkloadId.set(workloadId, certificate);
          }
        }
      });
    return byWorkloadId;
  }, [certificates]);

  useEffect(() => {
    const controller = new AbortController();
    void getAcademicWorkload(teacherCode, controller.signal).then((data) => {
      if (!controller.signal.aborted) { setRows(data); setError(null); onWorkloadsLoaded?.(data); }
    }).catch((e: unknown) => {
      if (!controller.signal.aborted) setError(e instanceof Error ? e.message : "No se pudo cargar la carga academica");
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [teacherCode, onWorkloadsLoaded, retry]);
  async function generate(id: number) {
    setGenerating(id); setError(null); setMessage(null);
    try {
      const existingCertificate = certificatesByWorkloadId.get(id);
      const response = await generateWorkloadCertificate(id);
      setMessage(existingCertificate?.generationId === response.generationId
        ? "No se genero una nueva version porque no hay cambios academicos respecto a la version vigente."
        : existingCertificate
          ? "Constancia regenerada correctamente."
          : "Constancia generada correctamente.");
      await onGenerated?.();
    } catch (e) { setError(e instanceof Error ? e.message : "No se pudo generar la constancia"); }
    finally { setGenerating(null); }
  }
  return <section className="min-w-0 space-y-3">
    <h2 className="text-xl font-semibold">Carga academica</h2>
    {loading && <p role="status">Cargando carga academica...</p>}
    {error && <div role="alert"><p>{error}</p><button type="button" className="min-h-10 underline" onClick={() => setRetry((n) => n + 1)}>Reintentar consulta</button></div>}
    {message && <p role="status">{message}</p>}
    {!loading && !error && rows.length === 0 && <p>No hay carga academica registrada.</p>}
    {rows.length > 0 && <div className="w-full overflow-x-auto rounded-md border border-[var(--border)]">
      <table className="w-full min-w-[800px] text-left text-sm">
        <thead className="bg-[var(--surface-soft)]"><tr>
          {["Periodo", "Curso", "Ciclo", "Seccion", "Escuela", "Plan", ...(onGenerated ? ["Acciones"] : [])].map((label) => <th key={label} className="p-3">{label}</th>)}
        </tr></thead>
        <tbody>{rows.map((row) => {
          const certificate = certificatesByWorkloadId.get(row.academicWorkloadId);
          const isApproved = certificate ? isSignedStatus(certificate.status) : false;
          const actionLabel = certificate
            ? isApproved
              ? "Firmada"
              : "Regenerar constancia"
            : "Generar constancia";

          return (
            <tr key={row.academicWorkloadId} className="border-t border-[var(--border)]">
              <td className="p-3">{row.academicPeriod}</td><td className="p-3">{row.courseCode} · {row.courseName}</td>
              <td className="p-3">{row.cycle}</td><td className="p-3">{row.section}</td><td className="p-3">{row.school}</td><td className="p-3">{row.plan}</td>
              {onGenerated && <td className="p-3"><button type="button" disabled={generating !== null || isApproved}
                className="min-h-10 whitespace-nowrap rounded-md bg-[var(--gold)] px-3 text-[#15130c] disabled:cursor-not-allowed disabled:opacity-55"
                onClick={() => void generate(row.academicWorkloadId)}>{generating === row.academicWorkloadId ? "Generando..." : actionLabel}</button></td>}
            </tr>
          );
        })}</tbody>
      </table>
    </div>}
  </section>;
}
