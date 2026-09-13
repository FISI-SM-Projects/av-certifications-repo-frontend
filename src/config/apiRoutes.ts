export const API_ROUTES = {
  AUTH_LOGIN: "/api/v1/auth/login",
  AUTH_CONTEXT_LEGACY: "/api/v1/auth/me",
  TEACHER_ME: "/api/v1/teachers/me",
  TEACHER_ME_COURSES: "/api/v1/teachers/me/courses",
  CERTIFICATES: "/api/v1/certificates",
  certificateById: (id: string) => `/api/v1/certificates/${encodeURIComponent(id)}`,
  certificateDocument: (id: string, disposition: "inline" | "attachment" = "inline") =>
    `/api/v1/certificates/${encodeURIComponent(id)}/document?disposition=${disposition}`,
  certificateVersions: (id: string) => `/api/v1/certificates/${encodeURIComponent(id)}/versions`,
  certificateSignature: (id: string) => `/api/v1/certificates/${encodeURIComponent(id)}/signature`,
  LEGACY_CERTIFICATE_COURSE: "/api/v1/constancias/curso",
  LEGACY_CERTIFICATE_SEMESTER: "/api/v1/constancias/semestral",
  legacyTeacherCertificates: (teacherCode: string) =>
    `/api/v1/constancias/docentes/${encodeURIComponent(teacherCode)}`,
  legacyCertificateDetail: (generationId: string) =>
    `/api/v1/constancias/generaciones/${encodeURIComponent(generationId)}`,
  legacyCertificateHistory: (certificateKey: string) =>
    `/api/v1/constancias/certificados/${encodeURIComponent(certificateKey)}/historial`,
  legacyCertificatePdf: (generationId: string) =>
    `/api/v1/constancias/generaciones/${encodeURIComponent(generationId)}/pdf`,
  legacyCertificateDownload: (generationId: string) =>
    `/api/v1/constancias/generaciones/${encodeURIComponent(generationId)}/download`,
  legacyDirectorTeachers: (department: string) =>
    `/api/v1/director/docentes?departamentoAcademico=${encodeURIComponent(department)}`,
} as const;

