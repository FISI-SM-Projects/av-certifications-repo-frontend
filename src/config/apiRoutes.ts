export const API_ROUTES = {
  auth: {
    login: "/api/v1/auth/login",
  },
  teachers: {
    me: "/api/v1/teachers/me",
    courses: "/api/v1/teachers/me/courses",
    certificates: {
      root: "/api/v1/teachers/me/constancias",
      course: "/api/v1/teachers/me/constancias/curso",
      semester: "/api/v1/teachers/me/constancias/semestral",
      generation: (generationId: string) =>
        `/api/v1/teachers/me/constancias/generaciones/${encodeURIComponent(generationId)}`,
      history: (certificateKey: string) =>
        `/api/v1/teachers/me/constancias/certificados/${encodeURIComponent(certificateKey)}/historial`,
      pdf: (generationId: string) =>
        `/api/v1/teachers/me/constancias/generaciones/${encodeURIComponent(generationId)}/pdf`,
      download: (generationId: string) =>
        `/api/v1/teachers/me/constancias/generaciones/${encodeURIComponent(generationId)}/download`,
    },
  },
  certificates: {
    generation: (generationId: string) =>
      `/api/v1/constancias/generaciones/${encodeURIComponent(generationId)}`,
    history: (certificateKey: string) =>
      `/api/v1/constancias/certificados/${encodeURIComponent(certificateKey)}/historial`,
    pdf: (generationId: string) =>
      `/api/v1/constancias/generaciones/${encodeURIComponent(generationId)}/pdf`,
    download: (generationId: string) =>
      `/api/v1/constancias/generaciones/${encodeURIComponent(generationId)}/download`,
  },
} as const;
