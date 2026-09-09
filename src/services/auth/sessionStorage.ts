import type { RolUsuario, UsuarioSesion } from "@/types/auth/auth.types";

const SESSION_STORAGE_KEY = "gestion-docente-session";
export const AUTH_SESSION_CLEARED_EVENT = "gestion-docente-auth-session-cleared";
const ROLES_VALIDOS: RolUsuario[] = ["DOCENTE", "DIRECTOR", "ADMIN"];

function estaEnNavegador(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function esRolUsuario(value: unknown): value is RolUsuario {
  return typeof value === "string" && ROLES_VALIDOS.includes(value as RolUsuario);
}

function esStringONull(value: unknown): value is string | null {
  return typeof value === "string" || value === null;
}

function esNumeroONullOUndefined(value: unknown): value is number | null | undefined {
  return typeof value === "number" || value === null || value === undefined;
}

function esStringArrayOUndefined(value: unknown): value is string[] | undefined {
  return value === undefined || (Array.isArray(value) && value.every((item) => typeof item === "string"));
}

export function esUsuarioSesionValido(value: unknown): value is UsuarioSesion {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const usuario = value as Record<string, unknown>;

  const camposBaseValidos =
    typeof usuario.id === "number" &&
    typeof usuario.fullName === "string" &&
    typeof usuario.email === "string" &&
    esRolUsuario(usuario.role) &&
    esStringONull(usuario.departamentoAcademico) &&
    esStringONull(usuario.teacherCode);

  if (!camposBaseValidos) {
    return false;
  }

  return (
    usuario.authMode === "jwt" &&
    (usuario.token === undefined || typeof usuario.token === "string") &&
    (usuario.tokenType === undefined || typeof usuario.tokenType === "string") &&
    (usuario.subject === undefined || typeof usuario.subject === "string") &&
    esNumeroONullOUndefined(usuario.personId) &&
    esNumeroONullOUndefined(usuario.accountId) &&
    esNumeroONullOUndefined(usuario.expiresAt) &&
    esStringArrayOUndefined(usuario.roles)
  );
}

export function guardarSesion(usuario: UsuarioSesion): void {
  if (!estaEnNavegador()) {
    return;
  }

  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(usuario));
}

export function obtenerSesion(): UsuarioSesion | null {
  if (!estaEnNavegador()) {
    return null;
  }

  const sesionGuardada = window.localStorage.getItem(SESSION_STORAGE_KEY);

  if (sesionGuardada === null) {
    return null;
  }

  try {
    const value = JSON.parse(sesionGuardada) as unknown;

    if (esUsuarioSesionValido(value)) {
      return value;
    }
  } catch {
    // Si el JSON esta corrupto, se elimina abajo.
  }

  eliminarSesion();
  return null;
}

export function eliminarSesion(): void {
  if (!estaEnNavegador()) {
    return;
  }

  window.localStorage.removeItem(SESSION_STORAGE_KEY);
  window.dispatchEvent(new Event(AUTH_SESSION_CLEARED_EVENT));
}

export function obtenerTokenSesion(): string | null {
  const sesion = obtenerSesion();

  if (sesion?.authMode !== "jwt" || !sesion.token) {
    return null;
  }

  if (sesion.expiresAt !== null && sesion.expiresAt !== undefined) {
    const expiresAtMs = sesion.expiresAt * 1000;

    if (Number.isFinite(expiresAtMs) && Date.now() >= expiresAtMs) {
      eliminarSesion();
      return null;
    }
  }

  return sesion.token;
}
