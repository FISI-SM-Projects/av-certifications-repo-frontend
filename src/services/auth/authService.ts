import { ApiError, httpJson, isRecord } from "@/lib/api/httpClient";
import type {
  DemoLoginRequest,
  DemoLoginResponse,
  RealLoginRequest,
  RealLoginResponse,
  RolUsuario,
  UsuarioSesion,
} from "@/types/auth/auth.types";

const VALID_ROLES: RolUsuario[] = ["DOCENTE", "DIRECTOR", "ADMIN"];
const ROLE_PRIORITY: RolUsuario[] = ["ADMIN", "DIRECTOR", "DOCENTE"];
const DEV_LDAP_PROFILE_BY_SUBJECT: Record<
  string,
  Pick<UsuarioSesion, "fullName" | "email" | "departamentoAcademico" | "teacherCode">
> = {
  lmotaa: {
    fullName: "LAZARO FLORIAN MOTA ALVA",
    email: "lmotaa@unmsm.edu.pe",
    departamentoAcademico: "Ciencias de la Computacion",
    teacherCode: null,
  },
  lalarconl: {
    fullName: "María Elena Torres Rojas",
    email: "mtorres@unmsm.edu.pe",
    departamentoAcademico: "Ingeniería de Software",
    teacherCode: "082027",
  },
  cnavarrod: {
    fullName: "Carlos Alberto Ramos Silva",
    email: "cramos@unmsm.edu.pe",
    departamentoAcademico: "Ciencia de la Computación",
    teacherCode: "082028",
  },
  "aulavirtual.fisi": {
    fullName: "AULA VIRTUAL FISI",
    email: "aulavirtual.fisi@unmsm.edu.pe",
    departamentoAcademico: null,
    teacherCode: null,
  },
};

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

  return buildJwtSession(response, claims, request.username);
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

  return { user: { ...payload.user, authMode: "demo" } };
}

function validateRealLoginResponse(payload: unknown): RealLoginResponse {
  if (
    !isRecord(payload) ||
    typeof payload.token !== "string" ||
    payload.token.trim() === "" ||
    typeof payload.type !== "string"
  ) {
    throw new ApiError("La respuesta de login real no tiene el formato esperado.", 0);
  }

  return {
    token: payload.token,
    type: payload.type,
  };
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
  fallbackUsername: string,
): UsuarioSesion {
  const subject = typeof claims.sub === "string" && claims.sub.trim() !== ""
    ? claims.sub.trim()
    : fallbackUsername;
  const roles = normalizeJwtRoles(claims.roles);
  const role = resolvePrimaryRole(roles);
  const devProfile = DEV_LDAP_PROFILE_BY_SUBJECT[subject] ?? null;

  if (role === null) {
    throw new ApiError("La cuenta no tiene un rol reconocido para esta interfaz.", 0);
  }

  return {
    id: readNumericClaim(claims.accountId) ?? readNumericClaim(claims.personId) ?? 0,
    fullName: devProfile?.fullName ?? subject,
    email: devProfile?.email ?? buildEmailFallback(subject),
    role,
    departamentoAcademico: devProfile?.departamentoAcademico ?? null,
    teacherCode: role === "DOCENTE" ? (devProfile?.teacherCode ?? null) : null,
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

function normalizeJwtRoles(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((role): role is string => typeof role === "string");
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

function buildEmailFallback(subject: string): string {
  return subject.includes("@") ? subject : `${subject}@unmsm.edu.pe`;
}
