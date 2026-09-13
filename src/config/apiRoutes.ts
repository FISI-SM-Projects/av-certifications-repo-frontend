export const API_ROUTES = {
  AUTH_LOGIN: "/auth/login",
  HEALTH: "/health",
  TEACHER_ME: "/teachers/me",
  TEACHER_ME_COURSES: "/teachers/me/courses",
  TEACHERS: "/teachers",
  CERTIFICATES: "/certificates",
  certificateById: (id: string) => `/certificates/${encodeURIComponent(id)}`,
  certificateDocument: (id: string, disposition: "inline" | "attachment" = "inline") =>
    `/certificates/${encodeURIComponent(id)}/document?disposition=${disposition}`,
  certificateVersions: (id: string) => `/certificates/${encodeURIComponent(id)}/versions`,
  certificateSignature: (id: string) => `/certificates/${encodeURIComponent(id)}/signature`,
} as const;

