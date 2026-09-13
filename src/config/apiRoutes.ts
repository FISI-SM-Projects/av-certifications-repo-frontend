export const API_ROUTES = {
  AUTH_LOGIN: "/api/v1/auth/login",
  AUTH_CONTEXT_LEGACY: "/api/v1/auth/me",
  TEACHER_ME: "/api/v1/teachers/me",
  TEACHER_ME_COURSES: "/api/v1/teachers/me/courses",
  TEACHERS: "/api/v1/teachers",
  CERTIFICATES: "/api/v1/certificates",
  certificateById: (id: string) => `/api/v1/certificates/${encodeURIComponent(id)}`,
  certificateDocument: (id: string, disposition: "inline" | "attachment" = "inline") =>
    `/api/v1/certificates/${encodeURIComponent(id)}/document?disposition=${disposition}`,
  certificateVersions: (id: string) => `/api/v1/certificates/${encodeURIComponent(id)}/versions`,
  certificateSignature: (id: string) => `/api/v1/certificates/${encodeURIComponent(id)}/signature`,
} as const;

