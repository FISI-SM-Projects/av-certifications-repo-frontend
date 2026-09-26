import { API_ROUTES } from "@/config/apiRoutes";
import { ApiError, httpJson, isRecord } from "@/lib/api/httpClient";
import type { TeacherProfileResponse } from "@/types/docente/teacherProfile.types";
import type {
  DemoLoginRequest,
  DemoLoginResponse,
  LoginRequest,
  LoginResponse,
  RolUsuario,
  UsuarioSesion,
} from "@/types/auth/auth.types";

const VALID_ROLES: RolUsuario[] = ["DOCENTE", "DIRECTOR", "ADMIN"];

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  return httpJson<LoginResponse>(API_ROUTES.auth.login, {
    method: "POST",
    body: credentials,
    validate: validateLoginResponse,
  });
}

export async function getAuthenticatedTeacher(): Promise<TeacherProfileResponse> {
  return httpJson<TeacherProfileResponse>(API_ROUTES.teachers.me, {
    validate: validateTeacherProfileResponse,
  });
}

export async function obtenerUsuariosDemo(): Promise<UsuarioSesion[]> {
  return httpJson<UsuarioSesion[]>("/api/v1/auth/demo-users", {
    validate: validateUsuariosDemo,
  });
}

export async function loginDemo(email: string): Promise<DemoLoginResponse> {
  const request: DemoLoginRequest = { email };

  return httpJson<DemoLoginResponse>("/api/v1/auth/demo-login", {
    method: "POST",
    body: request,
    validate: validateDemoLoginResponse,
  });
}

function validateLoginResponse(payload: unknown): LoginResponse {
  if (
    !isRecord(payload) ||
    payload.success !== true ||
    typeof payload.message !== "string" ||
    !isRecord(payload.data) ||
    payload.data.type !== "Bearer" ||
    typeof payload.data.token !== "string" ||
    payload.data.token.trim() === ""
  ) {
    throw new ApiError("La respuesta de login real no tiene el formato esperado.", 0);
  }

  return {
    success: true,
    message: payload.message,
    data: { type: "Bearer", token: payload.data.token },
  };
}

function validateTeacherProfileResponse(payload: unknown): TeacherProfileResponse {
  if (
    !isRecord(payload) ||
    payload.success !== true ||
    typeof payload.message !== "string" ||
    !isRecord(payload.data)
  ) {
    throw new ApiError("La respuesta del perfil docente no tiene el formato esperado.", 0);
  }

  const teacher = payload.data;
  if (
    typeof teacher.id !== "number" ||
    typeof teacher.personId !== "number" ||
    (teacher.moodleId !== null && typeof teacher.moodleId !== "number") ||
    typeof teacher.code !== "string" ||
    (teacher.dni !== null && typeof teacher.dni !== "string") ||
    typeof teacher.firstName !== "string" ||
    typeof teacher.paternalLastName !== "string" ||
    (teacher.maternalLastName !== null && typeof teacher.maternalLastName !== "string") ||
    (teacher.department !== null &&
      teacher.department !== "CC" &&
      teacher.department !== "SW" &&
      teacher.department !== "EG" &&
      teacher.department !== "NA") ||
    (teacher.registerState !== "ACTIVO" &&
      teacher.registerState !== "SUSPENDIDO" &&
      teacher.registerState !== "ELIMINADO")
  ) {
    throw new ApiError("La respuesta del perfil docente no tiene el formato esperado.", 0);
  }

  return payload as TeacherProfileResponse;
}

function validateUsuariosDemo(payload: unknown): UsuarioSesion[] {
  if (!Array.isArray(payload) || !payload.every(isUsuarioSesion)) {
    throw new ApiError("La respuesta de usuarios demo no tiene el formato esperado.", 0);
  }

  return payload;
}

function validateDemoLoginResponse(payload: unknown): DemoLoginResponse {
  if (!isRecord(payload) || !isUsuarioSesion(payload.user)) {
    throw new ApiError("La respuesta de login demo no tiene el formato esperado.", 0);
  }

  return { user: payload.user };
}

function isUsuarioSesion(value: unknown): value is UsuarioSesion {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "number" &&
    typeof value.fullName === "string" &&
    typeof value.email === "string" &&
    isRolUsuario(value.role) &&
    (typeof value.departamentoAcademico === "string" || value.departamentoAcademico === null) &&
    (typeof value.teacherCode === "string" || value.teacherCode === null)
  );
}

function isRolUsuario(value: unknown): value is RolUsuario {
  return typeof value === "string" && VALID_ROLES.includes(value as RolUsuario);
}
