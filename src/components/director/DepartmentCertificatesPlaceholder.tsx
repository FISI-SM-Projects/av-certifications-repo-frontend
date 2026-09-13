"use client";

import { useEffect, useMemo, useState } from "react";

import { CertificateSummaryTable } from "@/components/constancia/CertificateSummaryTable";
import {
  firmarConstancia,
  listarConstancias,
} from "@/services/constancia/constanciaService";
import type { CertificateGenerationSummary } from "@/types/constancia/constancia.types";
import { isGeneratedStatus } from "@/utils/constancia/certificateStatus";

export function DepartmentCertificatesPlaceholder() {
  const [certificates, setCertificates] = useState<CertificateGenerationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [signingId, setSigningId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadCertificates() {
    try {
      setError(null);
      const data = await listarConstancias({ size: 50 });
      setCertificates(data);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No se pudieron cargar las constancias del departamento.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function loadInitialCertificates() {
      try {
        setError(null);
        const data = await listarConstancias({ size: 50 });
        if (isMounted) {
          setCertificates(data);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "No se pudieron cargar las constancias del departamento.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadInitialCertificates();

    return () => {
      isMounted = false;
    };
  }, []);

  const pendingCertificates = useMemo(
    () => certificates.filter((certificate) => isGeneratedStatus(certificate.status)),
    [certificates],
  );
  const signedCertificates = useMemo(
    () => certificates.filter((certificate) => !isGeneratedStatus(certificate.status)),
    [certificates],
  );

  async function handleSign(certificate: CertificateGenerationSummary) {
    if (signingId !== null) {
      return;
    }

    try {
      setSigningId(certificate.generationId);
      setMessage(null);
      setError(null);
      await firmarConstancia(certificate.generationId);
      setMessage("La constancia fue firmada y el PDF visible institucional quedo disponible.");
      await loadCertificates();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No se pudo firmar la constancia seleccionada.",
      );
    } finally {
      setSigningId(null);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--gold-soft)]">
          Firma departamental
        </p>
        <h3 className="mt-2 text-xl font-semibold text-[var(--text)]">
          Constancias pendientes y firmadas
        </h3>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
          Las constancias generadas se muestran primero para firma. Las constancias ya firmadas
          quedan visibles como consulta departamental.
        </p>
      </section>

      {error !== null ? (
        <section className="rounded-lg border border-red-900/50 bg-[var(--danger-soft)] p-4 text-sm text-red-100">
          {error}
        </section>
      ) : null}
      {message !== null ? (
        <section className="rounded-lg border border-[rgba(79,155,97,0.55)] bg-[rgba(79,155,97,0.14)] p-4 text-sm text-[#b8f0c4]">
          {message}
        </section>
      ) : null}

      {isLoading ? (
        <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6">
          <p className="text-sm text-[var(--muted)]">Cargando constancias del departamento...</p>
        </section>
      ) : (
        <>
          <DirectorSignableTable
            certificates={pendingCertificates}
            onSign={handleSign}
            signingId={signingId}
          />

          <CertificateSummaryTable
            certificates={signedCertificates}
            detailReturnTo="/director/constancias"
            emptyMessage="Aun no hay constancias firmadas en el departamento."
            showTeacherCode
          />
        </>
      )}
    </div>
  );
}

function DirectorSignableTable({
  certificates,
  onSign,
  signingId,
}: {
  certificates: CertificateGenerationSummary[];
  onSign: (certificate: CertificateGenerationSummary) => void;
  signingId: string | null;
}) {
  if (certificates.length === 0) {
    return (
      <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6">
        <h4 className="text-lg font-semibold text-[var(--text)]">Pendientes de firma</h4>
        <p className="mt-2 text-sm text-[var(--muted)]">
          No hay constancias generadas pendientes de firma.
        </p>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-lg border border-[rgba(201,168,93,0.42)] bg-[var(--surface)]">
      <div className="border-b border-[var(--border)] px-5 py-4">
        <h4 className="text-lg font-semibold text-[var(--text)]">Pendientes de firma</h4>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Firma solo constancias generadas del departamento.
        </p>
      </div>
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[880px] border-collapse text-left text-sm">
          <thead className="bg-[var(--surface-soft)] text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
            <tr>
              <th className="px-4 py-3 font-semibold">Docente</th>
              <th className="px-4 py-3 font-semibold">Tipo</th>
              <th className="px-4 py-3 font-semibold">Curso</th>
              <th className="px-4 py-3 font-semibold">Semestre</th>
              <th className="px-4 py-3 font-semibold">Version</th>
              <th className="px-4 py-3 font-semibold">Accion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-soft)]">
            {certificates.map((certificate) => (
              <tr key={certificate.generationId} className="align-middle">
                <td className="px-4 py-4 font-medium text-[var(--text)]">
                  {certificate.teacherCode}
                </td>
                <td className="px-4 py-4 text-[var(--muted)]">{certificate.type}</td>
                <td className="px-4 py-4 text-[var(--muted)]">
                  {certificate.courseCode ?? "Consolidacion semestral"}
                </td>
                <td className="px-4 py-4 text-[var(--muted)]">{certificate.semester}</td>
                <td className="px-4 py-4 text-[var(--muted)]">
                  v{String(certificate.version).padStart(3, "0")}
                </td>
                <td className="px-4 py-4">
                  <button
                    className="rounded-md bg-[var(--gold)] px-4 py-2 text-sm font-semibold text-[#15130c] transition hover:bg-[var(--gold-soft)] disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={signingId !== null}
                    onClick={() => onSign(certificate)}
                    type="button"
                  >
                    {signingId === certificate.generationId ? "Firmando..." : "Firmar"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
