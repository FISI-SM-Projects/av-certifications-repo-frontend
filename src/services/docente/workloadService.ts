import { ApiError, httpJson, isRecord } from "@/lib/api/httpClient";
import type { AcademicWorkload } from "@/types/docente/workload.types";
import type { CertificateGenerationSummary } from "@/types/constancia/constancia.types";
import { isCertificateStatus } from "@/types/constancia/constancia.types";

export function getAcademicWorkload(teacherCode: string, signal?: AbortSignal): Promise<AcademicWorkload[]> {
  return httpJson(`/api/v1/docentes/${encodeURIComponent(teacherCode)}/carga-academica`, {
    signal,
    validate: (value) => {
      if (!Array.isArray(value) || !value.every((w) => isRecord(w)
        && Number.isSafeInteger(w.academicWorkloadId) && typeof w.teacherCode === "string"
        && typeof w.academicPeriod === "string" && typeof w.courseCode === "string"
        && typeof w.courseName === "string" && typeof w.school === "string"
        && [w.cycle, w.section, w.plan, w.moodleId].every(Number.isSafeInteger))) {
        throw new ApiError("La carga academica recibida no es valida", 0);
      }
      return value as AcademicWorkload[];
    },
  });
}
export function generateWorkloadCertificate(academicWorkloadId: number): Promise<CertificateGenerationSummary> {
  return httpJson("/api/v1/constancias/curso", {
    method: "POST", body: { academicWorkloadId }, timeoutMs: 30_000,
    validate: (value) => {
      if (!isRecord(value) || typeof value.generationId !== "string" || !isCertificateStatus(value.status)) {
        throw new ApiError("La respuesta de generacion no es valida", 0);
      }
      return value as CertificateGenerationSummary;
    },
  });
}
