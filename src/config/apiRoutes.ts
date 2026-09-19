export const API_ROUTES = {
  auth: {
    login: "/api/v1/auth/login",
  },
  teachers: {
    me: "/api/v1/teachers/me",
    courses: "/api/v1/teachers/me/courses",
  },
} as const;
