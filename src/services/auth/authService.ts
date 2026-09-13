import { ApiError, httpJson, isRecord } from "@/lib/api/httpClient";
import { API_ROUTES } from "@/config/apiRoutes";
import type {
  RealLoginRequest,
  RealLoginResponse,
  RolUsuario,
  TeacherMe,
  UsuarioSesion,
} from "@/types/auth/auth.types";

const VALID_ROLES: RolUsuario[] = ["DOCENTE", "DIRECTOR", "ADMIN"];
const ROLE_PRIORITY: RolUsuario[] = ["ADMIN", "DIRECTOR", "DOCENTE"];

export async function loginReal(username: string, password: string): Promise<UsuarioSesion> {
  const request: RealLoginRequest = {
    username: username.trim(),
    password,
  };

  const response = await httpJson<RealLoginResponse>(API_ROUTES.AUTH_LOGIN, {
    method: "POST",
    body: request,
    validate: validateRealLoginResponse,
    defaultErrorMessage: "No se pudo iniciar sesion.",
    networkErrorMessage: "No se pudo conectar con el backend de autenticacion.",
  });
  const claims = decodeJwtClaims(response.token);

  const teacher = await fetchTeacherMeOrNull(response.token);
  return buildJwtSession(response, claims, teacher);
}

function validateRealLoginResponse(payload: unknown): RealLoginResponse {
  const loginPayload = extractLoginPayload(payload);

  if (
    loginPayload === null ||
    typeof loginPayload.token !== "string" ||
    loginPayload.token.trim() === "" ||
    typeof loginPayload.type !== "string"
  ) {
    throw new ApiError("La respuesta de login real no tiene el formato esperado.", 0);
  }

  return {
    token: loginPayload.token,
    type: loginPayload.type,
  };
}

function extractLoginPayload(payload: unknown): Record<string, unknown> | null {
  if (!isRecord(payload)) {
    return null;
  }

  if (isRecord(payload.data)) {
    return payload.data;
  }

  return payload;
}

function isRolUsuario(value: unknown): value is RolUsuario {
  return typeof value === "string" && VALID_ROLES.includes(value as RolUsuario);
}

type JwtClaims = {
  sub?: unknown;
  roles?: unknown;
  personId?: unknown;
  accountId?: unknown;
  exp?: unknown;
};

function buildJwtSession(
  response: RealLoginResponse,
  claims: JwtClaims,
  teacher: TeacherMe | null,
): UsuarioSesion {
  const subject = typeof claims.sub === "string" ? claims.sub : "";
  const roles = readRolesClaim(claims.roles);
  const role = resolvePrimaryRole(roles);
  const teacherCode = teacher?.code ?? null;
  const department = teacher?.department ?? null;

  if (role === "DOCENTE" && !teacherCode) {
    throw new ApiError("La cuenta no tiene perfil docente asociado", 403);
  }
  if (role === null) {
    throw new ApiError("La cuenta no tiene un rol reconocido para esta interfaz.", 0);
  }

  return {
    id: readNumericClaim(claims.accountId) ?? 0,
    fullName: teacher ? `${teacher.firstName} ${teacher.paternalLastName}${teacher.maternalLastName ? ` ${teacher.maternalLastName}` : ""}` : subject,
    email: teacher?.email ?? "",
    role,
    departamentoAcademico: department,
    teacherCode,
    teacher: teacher
      ? { teacherId: teacher.id, teacherCode: teacher.code, moodleId: teacher.moodleId, department }
      : null,
    authMode: "jwt",
    token: response.token,
    tokenType: response.type,
    subject,
    personId: readNumericClaim(claims.personId),
    accountId: readNumericClaim(claims.accountId),
    expiresAt: readNumericClaim(claims.exp),
    roles,
  };
}

async function fetchTeacherMeOrNull(token: string): Promise<TeacherMe | null> {
  try {
    return await httpJson<TeacherMe>(API_ROUTES.TEACHER_ME, {
      headers: { Authorization: `Bearer ${token}` },
      validate: validateTeacherMeEnvelope,
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

function decodeJwtClaims(token: string): JwtClaims {
  const [, payload] = token.split(".");

  if (!payload) {
    throw new ApiError("El token recibido no tiene el formato esperado.", 0);
  }

  try {
    const json = decodeBase64Url(payload);
    const claims = JSON.parse(json) as unknown;

    if (!isRecord(claims)) {
      throw new Error("JWT payload is not an object");
    }

    return claims;
  } catch {
    throw new ApiError("No se pudo leer la sesion devuelta por el backend.", 0);
  }
}

function decodeBase64Url(value: string): string {
  const normalizedValue = value.replace(/-/g, "+").replace(/_/g, "/");
  const paddingLength = (4 - (normalizedValue.length % 4)) % 4;
  const paddedValue = `${normalizedValue}${"=".repeat(paddingLength)}`;

  return decodeURIComponent(
    Array.from(atob(paddedValue), (character) =>
      `%${character.charCodeAt(0).toString(16).padStart(2, "0")}`,
    ).join(""),
  );
}

function resolvePrimaryRole(roles: string[]): RolUsuario | null {
  const normalizedRoles = roles.map(normalizeRoleName);

  return ROLE_PRIORITY.find((role) => normalizedRoles.includes(role)) ?? null;
}

function normalizeRoleName(role: string): RolUsuario | null {
  const normalizedRole = role.trim().toUpperCase().replace(/^ROLE_/, "");

  if (normalizedRole === "DIRECTOR_ESCUELA") {
    return "DIRECTOR";
  }

  return isRolUsuario(normalizedRole) ? normalizedRole : null;
}

function readNumericClaim(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return value;
}

function readRolesClaim(value: unknown): string[] {
  if (!Array.isArray(value) || !value.every((role) => typeof role === "string")) {
    throw new ApiError("El token no contiene roles validos.", 0);
  }
  return value;
}

function validateTeacherMeEnvelope(value: unknown): TeacherMe {
  if (!isRecord(value) || value.success !== true || !isRecord(value.data)) {
    throw new ApiError("El perfil docente oficial no tiene el formato esperado", 0);
  }

  const teacher = value.data;
  if (!Number.isSafeInteger(teacher.id) || !Number.isSafeInteger(teacher.personId)
    || !Number.isSafeInteger(teacher.moodleId) || typeof teacher.code !== "string"
    || !(teacher.dni === null || typeof teacher.dni === "string")
    || typeof teacher.email !== "string" || typeof teacher.firstName !== "string"
    || typeof teacher.paternalLastName !== "string"
    || !(teacher.maternalLastName === null || typeof teacher.maternalLastName === "string")
    || !(teacher.department === null || typeof teacher.department === "string")
    || typeof teacher.registerState !== "string") {
    throw new ApiError("El perfil docente oficial no tiene el formato esperado", 0);
  }

  return teacher as TeacherMe;
}

export async function refreshRealSession(session: UsuarioSesion): Promise<UsuarioSesion> {
  if (!session.token) throw new ApiError("Autenticacion requerida", 401);
  const teacher = await fetchTeacherMeOrNull(session.token);
  return buildJwtSession({ token: session.token, type: "Bearer" }, decodeJwtClaims(session.token), teacher);
}
