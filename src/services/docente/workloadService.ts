import { ApiError, httpJson, isRecord } from "@/lib/api/httpClient";
import { API_ROUTES } from "@/config/apiRoutes";
import type { PaginatedApiEnvelope } from "@/types/api.types";
import type { AcademicWorkload } from "@/types/docente/workload.types";
import type { CertificateApiResponse, CertificateGenerationSummary } from "@/types/constancia/constancia.types";
import { isCertificateStatus } from "@/types/constancia/constancia.types";
import { mapCertificateToSummary } from "@/services/constancia/constanciaService";

export function getAcademicWorkload(teacherCode: string, signal?: AbortSignal): Promise<AcademicWorkload[]> {
  void teacherCode;
  return httpJson(API_ROUTES.TEACHER_ME_COURSES, {
    signal,
    validate: (value): AcademicWorkload[] => {
      if (!isTeacherCoursesEnvelope(value)) {
        throw new ApiError("La carga academica recibida no es valida", 0);
      }
      return value.data.map((w) => ({
        academicWorkloadId: w.id,
        teacherCode,
        academicPeriod: w.academicPeriod.semesterCode,
        courseCode: w.course.code,
        courseName: w.course.name,
        cycle: w.cycle,
        section: w.section,
        school: w.school,
        plan: w.plan,
        moodleId: w.moodleId,
      }));
    },
  });
}
export function generateWorkloadCertificate(academicWorkloadId: number): Promise<CertificateGenerationSummary> {
  return httpJson(API_ROUTES.CERTIFICATES, {
    method: "POST", body: { certificateType: "COURSE", academicWorkloadId }, timeoutMs: 30_000,
    validate: (value) => {
      if (!isRecord(value) || value.success !== true || !isCertificateApiResponse(value.data)) {
        throw new ApiError("La respuesta de generacion no es valida", 0);
      }
      return mapCertificateToSummary(value.data);
    },
  });
}

type TeacherCourseItem = {
  id: number;
  moodleId: number;
  teacherId: number;
  cycle: number;
  section: number;
  plan: number;
  school: string;
  course: { id: number; code: string; name: string };
  academicPeriod: { id: number; semesterCode: string; startDate: string; endDate: string };
};

function isTeacherCoursesEnvelope(value: unknown): value is PaginatedApiEnvelope<TeacherCourseItem[]> {
  return isRecord(value) && value.success === true && Array.isArray(value.data)
    && isRecord(value.pagination)
    && value.data.every((w) => isRecord(w)
      && Number.isSafeInteger(w.id) && Number.isSafeInteger(w.moodleId)
      && Number.isSafeInteger(w.teacherId) && Number.isSafeInteger(w.cycle)
      && Number.isSafeInteger(w.section) && Number.isSafeInteger(w.plan)
      && typeof w.school === "string" && isRecord(w.course)
      && Number.isSafeInteger(w.course.id) && typeof w.course.code === "string"
      && typeof w.course.name === "string" && isRecord(w.academicPeriod)
      && Number.isSafeInteger(w.academicPeriod.id)
      && typeof w.academicPeriod.semesterCode === "string"
      && typeof w.academicPeriod.startDate === "string"
      && typeof w.academicPeriod.endDate === "string");
}

function isCertificateApiResponse(value: unknown): value is CertificateApiResponse {
  return isRecord(value)
    && Number.isSafeInteger(value.id)
    && typeof value.certificateKey === "string"
    && (value.certificateType === "COURSE" || value.certificateType === "SEMESTER")
    && isCertificateStatus(value.status)
    && Number.isSafeInteger(value.version)
    && Number.isSafeInteger(value.teacherId)
    && typeof value.teacherCode === "string"
    && typeof value.teacherFullName === "string"
    && Number.isSafeInteger(value.academicPeriodId)
    && typeof value.semester === "string"
    && (value.academicWorkloadId === null || Number.isSafeInteger(value.academicWorkloadId))
    && (value.course === null || (isRecord(value.course) && Number.isSafeInteger(value.course.id)
      && typeof value.course.code === "string" && typeof value.course.name === "string"))
    && (value.section === null || Number.isSafeInteger(value.section))
    && (value.cycle === null || Number.isSafeInteger(value.cycle))
    && (value.school === null || typeof value.school === "string")
    && (value.plan === null || Number.isSafeInteger(value.plan))
    && (value.generatedAt === null || typeof value.generatedAt === "string")
    && (value.signedAt === null || typeof value.signedAt === "string")
    && typeof value.pdfAvailable === "boolean"
    && typeof value.documentUrl === "string";
}
