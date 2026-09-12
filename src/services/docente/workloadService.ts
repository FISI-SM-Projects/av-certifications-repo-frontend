import { ApiError, httpJson, isRecord } from "@/lib/api/httpClient";
import { API_ROUTES } from "@/config/apiRoutes";
import type { PaginatedApiEnvelope } from "@/types/api.types";
import type { AcademicWorkload } from "@/types/docente/workload.types";
import type { CertificateGenerationSummary } from "@/types/constancia/constancia.types";
import { isCertificateStatus } from "@/types/constancia/constancia.types";

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
  return httpJson(API_ROUTES.LEGACY_CERTIFICATE_COURSE, {
    method: "POST", body: { academicWorkloadId }, timeoutMs: 30_000,
    validate: (value) => {
      if (!isRecord(value) || typeof value.generationId !== "string" || !isCertificateStatus(value.status)) {
        throw new ApiError("La respuesta de generacion no es valida", 0);
      }
      return value as CertificateGenerationSummary;
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
