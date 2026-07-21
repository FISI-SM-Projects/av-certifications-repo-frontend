"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { LogoutButton } from "@/components/auth/LogoutButton";
import { useAuth } from "@/context/auth/AuthProvider";
import { isDemoMode } from "@/lib/uiMode";
import { loginDemo, obtenerUsuariosDemo } from "@/services/auth/authService";
import type { RolUsuario, UsuarioSesion } from "@/types/auth/auth.types";

function obtenerRutaPorRol(role: RolUsuario): string {
  if (role === "DOCENTE") {
    return "/perfil-docente";
  }

  if (role === "DIRECTOR") {
    return "/director";
  }

  if (role === "ADMIN") {
    return "/admin";
  }

  throw new Error("Rol de usuario no reconocido");
}

function etiquetaDepartamento(usuario: UsuarioSesion): string {
  return usuario.departamentoAcademico ?? "Sin departamento asignado";
}

function etiquetaTeacherCode(usuario: UsuarioSesion): string {
  return usuario.teacherCode ?? "No aplica";
}

export function DemoLoginSelector() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading, isAuthenticated, login } = useAuth();
  const isDemo = isDemoMode();
  const [usuarios, setUsuarios] = useState<UsuarioSesion[]>([]);
  const [selectedEmail, setSelectedEmail] = useState("");
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function cargarUsuarios() {
      try {
        setIsLoadingUsers(true);
        setLoadError(null);
        const usuariosDemo = await obtenerUsuariosDemo();

        if (!isMounted) {
          return;
        }

        setUsuarios(usuariosDemo);
        setSelectedEmail((currentEmail) => currentEmail || usuariosDemo[0]?.email || "");
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setLoadError(error instanceof Error ? error.message : "No se pudieron cargar los usuarios");
      } finally {
        if (isMounted) {
          setIsLoadingUsers(false);
        }
      }
    }

    cargarUsuarios();

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedUser = useMemo(
    () => usuarios.find((usuario) => usuario.email === selectedEmail) ?? null,
    [usuarios, selectedEmail],
  );

  function continuarConSesionActiva() {
    if (user === null) {
      return;
    }

    router.push(obtenerRutaPorRol(user.role));
  }

  async function handleLogin() {
    if (selectedUser === null || isLoggingIn) {
      return;
    }

    try {
      setIsLoggingIn(true);
      setLoginError(null);
      setSuccessMessage(null);

      const response = await loginDemo(selectedUser.email);
      login(response.user);

      const destino = obtenerRutaPorRol(response.user.role);
      setSuccessMessage(
        isDemo
          ? `Sesion simulada iniciada. Redirigiendo a ${destino}...`
          : `Sesion iniciada. Redirigiendo a ${destino}...`,
      );
      router.push(destino);
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "No se pudo iniciar la sesion");
    } finally {
      setIsLoggingIn(false);
    }
  }

  if (isAuthLoading) {
    return (
      <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6">
        <p className="text-sm text-[var(--muted)]">Cargando sesion local...</p>
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
          <p>
            Departamento:{" "}
            <span className="font-medium text-[var(--text)]">{etiquetaDepartamento(user)}</span>
          </p>
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
    <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_18px_45px_rgba(0,0,0,0.22)]">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--gold-soft)]">
          {isDemo ? "Acceso de demostracion" : "Acceso"}
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-[var(--text)]">
          {isDemo ? "Selecciona un usuario demo" : "Selecciona tu usuario"}
        </h2>
        {isDemo ? (
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Esta pantalla valida navegacion por rol con una sesion local simulada. No usa contrasenas, tokens ni seguridad real.
          </p>
        ) : null}
      </div>

      {isLoadingUsers ? (
        <div className="mt-6 rounded-md border border-[var(--border-soft)] bg-[var(--surface-muted)] p-4 text-sm text-[var(--muted)]">
          {isDemo ? "Cargando usuarios demo..." : "Cargando usuarios..."}
        </div>
      ) : null}

      {loadError !== null ? (
        <div className="mt-6 rounded-md border border-red-900/50 bg-[var(--danger-soft)] p-4 text-sm text-red-100">
          {loadError}
        </div>
      ) : null}

      {!isLoadingUsers && loadError === null ? (
        <div className="mt-6 space-y-3">
          {usuarios.map((usuario) => {
            const isSelected = usuario.email === selectedEmail;

            return (
              <button
                className={`w-full rounded-lg border p-4 text-left transition ${
                  isSelected
                    ? "border-[var(--gold)] bg-[rgba(201,168,93,0.10)]"
                    : "border-[var(--border-soft)] bg-[var(--surface-muted)] hover:border-[var(--guinda-soft)]"
                }`}
                key={usuario.email}
                onClick={() => {
                  setSelectedEmail(usuario.email);
                  setLoginError(null);
                  setSuccessMessage(null);
                }}
                type="button"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-semibold text-[var(--text)]">{usuario.fullName}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">{usuario.email}</p>
                  </div>
                  <span className="w-fit rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--text)]">
                    {usuario.role}
                  </span>
                </div>
                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-[var(--muted)]">Departamento academico</dt>
                    <dd className="mt-1 text-[var(--text)]">{etiquetaDepartamento(usuario)}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--muted)]">Teacher code</dt>
                    <dd className="mt-1 text-[var(--text)]">{etiquetaTeacherCode(usuario)}</dd>
                  </div>
                </dl>
              </button>
            );
          })}
        </div>
      ) : null}

      {loginError !== null ? (
        <div className="mt-5 rounded-md border border-red-900/50 bg-[var(--danger-soft)] p-4 text-sm text-red-100">
          {loginError}
        </div>
      ) : null}

      {successMessage !== null ? (
        <div className="mt-5 rounded-md border border-[var(--green)] bg-[var(--green-soft)] p-4 text-sm text-[var(--text)]">
          {successMessage}
        </div>
      ) : null}

      <button
        className="mt-6 w-full rounded-md bg-[var(--gold)] px-4 py-3 text-sm font-semibold text-[#15130c] transition hover:bg-[var(--gold-soft)] disabled:cursor-not-allowed disabled:opacity-50"
        disabled={selectedUser === null || isLoggingIn || isLoadingUsers}
        onClick={handleLogin}
        type="button"
      >
        {isLoggingIn ? "Iniciando sesion..." : "Ingresar con usuario seleccionado"}
      </button>
    </section>
  );
}
