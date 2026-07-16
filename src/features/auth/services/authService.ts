import { ApiError, httpJson, isRecord } from "@/lib/api/httpClient";
import type {
  DemoLoginRequest,
  DemoLoginResponse,
  RolUsuario,
  UsuarioSesion,
} from "@/features/auth/types/auth.types";

const VALID_ROLES: RolUsuario[] = ["DOCENTE", "DIRECTOR", "ADMIN"];

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
