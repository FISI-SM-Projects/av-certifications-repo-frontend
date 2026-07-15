import type { RolUsuario, UsuarioSesion } from "@/features/auth/types/auth.types";

const SESSION_STORAGE_KEY = "gestion-docente-session";
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

export function esUsuarioSesionValido(value: unknown): value is UsuarioSesion {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const usuario = value as Record<string, unknown>;

  return (
    typeof usuario.id === "number" &&
    typeof usuario.fullName === "string" &&
    typeof usuario.email === "string" &&
    esRolUsuario(usuario.role) &&
    esStringONull(usuario.departamentoAcademico) &&
    esStringONull(usuario.teacherCode)
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
}
