import { ApiError, httpJson, isRecord } from "@/lib/api/httpClient";
import type { InstitutionalContext } from "@/types/auth/auth.types";
import type {
  RealLoginRequest,
  RealLoginResponse,
  RolUsuario,
  UsuarioSesion,
} from "@/types/auth/auth.types";

const VALID_ROLES: RolUsuario[] = ["DOCENTE", "DIRECTOR", "ADMIN"];
const ROLE_PRIORITY: RolUsuario[] = ["ADMIN", "DIRECTOR", "DOCENTE"];

export async function loginReal(username: string, password: string): Promise<UsuarioSesion> {
  const request: RealLoginRequest = {
    username: username.trim(),
    password,
  };

  const response = await httpJson<RealLoginResponse>("/api/v1/auth/login", {
    method: "POST",
    body: request,
    validate: validateRealLoginResponse,
    defaultErrorMessage: "No se pudo iniciar sesion.",
    networkErrorMessage: "No se pudo conectar con el backend de autenticacion.",
  });
  const claims = decodeJwtClaims(response.token);

  const context = await httpJson<InstitutionalContext>("/api/v1/auth/me", {
    headers: { Authorization: `Bearer ${response.token}` },
    validate: validateInstitutionalContext,
  });
  return buildJwtSession(response, claims, context);
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
  context: InstitutionalContext,
): UsuarioSesion {
  const subject = context.ldapUid;
  const roles = context.roles;
  const role = resolvePrimaryRole(roles);

  if (role === "DOCENTE" && !context.teacher?.teacherCode) {
    throw new ApiError("La cuenta no tiene perfil docente asociado", 403);
  }
  if (role === null) {
    throw new ApiError("La cuenta no tiene un rol reconocido para esta interfaz.", 0);
  }

  return {
    id: context.accountId,
    fullName: context.fullName,
    email: context.institutionalEmail,
    role,
    departamentoAcademico: context.teacher?.department ?? null,
    teacherCode: context.teacher?.teacherCode ?? null,
    teacher: context.teacher,
    authMode: "jwt",
    token: response.token,
    tokenType: response.type,
    subject,
    personId: context.personId,
    accountId: context.accountId,
    expiresAt: readNumericClaim(claims.exp),
    roles,
  };
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

function validateInstitutionalContext(value: unknown): InstitutionalContext {
  if (!isRecord(value) || !Number.isSafeInteger(value.accountId) || !Number.isSafeInteger(value.personId)
    || typeof value.ldapUid !== "string" || typeof value.fullName !== "string"
    || typeof value.institutionalEmail !== "string" || !Array.isArray(value.roles)
    || !value.roles.every((role) => typeof role === "string")
    || value.accountStatus !== "ACTIVO" || value.personStatus !== "ACTIVO"
    || !(value.teacher === null || (isRecord(value.teacher)
      && Number.isSafeInteger(value.teacher.teacherId)
      && typeof value.teacher.teacherCode === "string" && value.teacher.teacherCode.trim() !== ""
      && Number.isSafeInteger(value.teacher.moodleId)
      && (value.teacher.department === null || typeof value.teacher.department === "string")))) {
    throw new ApiError("El contexto institucional no tiene el formato esperado", 0);
  }
  return value as InstitutionalContext;
}

export async function refreshRealSession(session: UsuarioSesion): Promise<UsuarioSesion> {
  if (!session.token) throw new ApiError("Autenticacion requerida", 401);
  const context = await httpJson<InstitutionalContext>("/api/v1/auth/me", {
    headers: { Authorization: `Bearer ${session.token}` }, validate: validateInstitutionalContext,
  });
  return buildJwtSession({ token: session.token, type: "Bearer" }, decodeJwtClaims(session.token), context);
}
