"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { LogoutButton } from "@/components/auth/LogoutButton";
import { useAuth } from "@/context/auth/AuthProvider";
import { loginReal } from "@/services/auth/authService";
import type { RolUsuario } from "@/types/auth/auth.types";

function obtenerRutaPorRol(role: RolUsuario): string {
  if (role === "ADMIN") {
    return "/admin";
  }

  if (role === "DIRECTOR") {
    return "/director";
  }

  if (role === "DOCENTE") {
    return "/perfil-docente";
  }

  return "/perfil-docente";
}

export function RealLoginForm() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading, isAuthenticated, login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function continuarConSesionActiva() {
    if (user === null) {
      return;
    }

    router.push(obtenerRutaPorRol(user.role));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const session = await loginReal(username, password);
      login(session);
      router.push(obtenerRutaPorRol(session.role));
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo iniciar sesion con la cuenta institucional.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isAuthLoading) {
    return (
      <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6">
        <p className="text-sm text-[var(--muted)]">Verificando sesion local...</p>
      </section>
    );
  }

  if (isAuthenticated && user !== null) {
    return (
      <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_18px_45px_rgba(0,0,0,0.22)]">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--gold-soft)]">
          Sesion activa
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-[var(--text)]">
          Ya ingresaste como {user.fullName}
        </h2>
        <div className="mt-4 rounded-md border border-[var(--border-soft)] bg-[var(--surface-muted)] p-4 text-sm text-[var(--muted)]">
          <p>
            Rol: <span className="font-medium text-[var(--text)]">{user.role}</span>
          </p>
          {user.subject ? (
            <p>
              Usuario: <span className="font-medium text-[var(--text)]">{user.subject}</span>
            </p>
          ) : null}
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            className="rounded-md bg-[var(--gold)] px-4 py-2 text-sm font-semibold text-[#15130c] transition hover:bg-[var(--gold-soft)]"
            onClick={continuarConSesionActiva}
            type="button"
          >
            Continuar
          </button>
          <LogoutButton />
        </div>
      </section>
    );
  }

  return (
    <form
      className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_18px_45px_rgba(0,0,0,0.22)]"
      onSubmit={handleSubmit}
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--gold-soft)]">
          Acceso institucional
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-[var(--text)]">
          Iniciar sesion
        </h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          Ingresa con tu usuario institucional habilitado para el Sistema de Constancias FISI.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        <label className="block text-sm font-medium text-[var(--text)]">
          Usuario institucional
          <input
            autoComplete="username"
            className="mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-3 text-[var(--text)] outline-none transition focus:border-[var(--gold)] focus:ring-2 focus:ring-[rgba(201,168,93,0.35)]"
            name="username"
            onChange={(event) => setUsername(event.target.value)}
            required
            type="text"
            value={username}
          />
        </label>

        <label className="block text-sm font-medium text-[var(--text)]">
          Contrasena
          <input
            autoComplete="current-password"
            className="mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-3 text-[var(--text)] outline-none transition focus:border-[var(--gold)] focus:ring-2 focus:ring-[rgba(201,168,93,0.35)]"
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </label>
      </div>

      {errorMessage !== null ? (
        <div
          className="mt-5 rounded-md border border-red-900/50 bg-[var(--danger-soft)] p-4 text-sm text-red-100"
          role="alert"
        >
          {errorMessage}
        </div>
      ) : null}

      <button
        className="mt-6 min-h-11 w-full rounded-md bg-[var(--gold)] px-4 py-3 text-sm font-semibold text-[#15130c] transition hover:bg-[var(--gold-soft)] disabled:cursor-not-allowed disabled:opacity-50"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Iniciando sesion..." : "Iniciar sesion"}
      </button>
    </form>
  );
}
