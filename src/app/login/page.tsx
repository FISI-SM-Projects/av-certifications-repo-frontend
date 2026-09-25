"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/auth/AuthProvider";
import { ApiError } from "@/lib/api/httpClient";

export default function LoginPage() {
  const router = useRouter();
  const { loginWithCredentials } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const submittingRef = useRef(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting || submittingRef.current) {
      return;
    }

    if (username.trim() === "" || password === "") {
      setErrorMessage("Ingresa tu usuario y contraseña.");
      return;
    }

    submittingRef.current = true;
    setIsSubmitting(true);
    setErrorMessage(null);
    let authenticated = false;

    try {
      await loginWithCredentials({ username: username.trim(), password });
      authenticated = true;
      router.replace("/perfil-docente");
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError && error.status === 401
          ? "Usuario o contraseña incorrectos."
          : "No se pudo iniciar sesión. Inténtalo nuevamente.",
      );
    } finally {
      if (!authenticated) {
        submittingRef.current = false;
        setIsSubmitting(false);
      }
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 py-8 text-[var(--text)]">
      <section className="w-full max-w-md rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_18px_45px_rgba(0,0,0,0.22)]">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--gold-soft)]">
          Gestión Docente FISI
        </p>
        <h1 className="mt-3 text-2xl font-semibold">Iniciar sesión</h1>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium" htmlFor="username">
              Usuario
            </label>
            <input
              autoComplete="username"
              className="control-focus w-full rounded-md border border-[var(--control-border)] bg-[var(--surface-muted)] px-3 py-2 text-[var(--text)]"
              id="username"
              onChange={(event) => setUsername(event.target.value)}
              required
              type="text"
              value={username}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium" htmlFor="password">
              Contraseña
            </label>
            <input
              autoComplete="current-password"
              className="control-focus w-full rounded-md border border-[var(--control-border)] bg-[var(--surface-muted)] px-3 py-2 text-[var(--text)]"
              id="password"
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </div>

          {errorMessage !== null ? (
            <p
              aria-live="polite"
              className="rounded-md border border-red-900/50 bg-[var(--danger-soft)] p-3 text-sm text-red-100"
              role="alert"
            >
              {errorMessage}
            </p>
          ) : null}

          <button
            className="control-focus w-full rounded-md bg-[var(--gold)] px-4 py-3 text-sm font-semibold text-[#15130c] transition hover:bg-[var(--gold-soft)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-[var(--gold)]"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Iniciando sesión..." : "Ingresar"}
          </button>
        </form>
      </section>
    </main>
  );
}
