"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";

import { useAuth } from "@/features/auth/context/AuthProvider";
import { ConstanciasTable } from "@/features/perfil-docente/components/ConstanciasTable";
import { DatosDocenteCard } from "@/features/perfil-docente/components/DatosDocenteCard";
import { PerfilDocenteHeader } from "@/features/perfil-docente/components/PerfilDocenteHeader";
import { ResumenConstanciasCard } from "@/features/perfil-docente/components/ResumenConstanciasCard";
import {
  obtenerPerfilDocentePorCodigo,
  PerfilDocenteApiError,
} from "@/features/perfil-docente/services/perfilDocenteService";
import type { PerfilDocenteResponse } from "@/features/perfil-docente/types/perfilDocente.types";

export function TeacherProfileView() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const teacherCode = user?.teacherCode?.trim() ?? "";
  const [perfil, setPerfil] = useState<PerfilDocenteResponse | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const cargarPerfil = useCallback(async () => {
    if (teacherCode === "") {
      setPerfil(null);
      setErrorMessage(null);
      return;
    }

    setIsLoadingProfile(true);
    setErrorMessage(null);

    try {
      const perfilDocente = await obtenerPerfilDocentePorCodigo(teacherCode);
      setPerfil(perfilDocente);
    } catch (error) {
      if (error instanceof PerfilDocenteApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("No se pudo conectar con el backend.");
      }
      setPerfil(null);
    } finally {
      setIsLoadingProfile(false);
    }
  }, [teacherCode]);

  useEffect(() => {
    if (isAuthLoading || teacherCode === "") {
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      void cargarPerfil();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [cargarPerfil, isAuthLoading, teacherCode]);

  if (isAuthLoading) {
    return <PanelMessage message="Verificando sesion..." />;
  }

  if (teacherCode === "") {
    return (
      <PanelMessage
        eyebrow="Sesion sin codigo docente"
        message="La consulta del perfil docente requiere que la sesion tenga un teacherCode."
        title="La sesion actual no tiene un codigo docente asociado."
      />
    );
  }

  if (isLoadingProfile) {
    return <PanelMessage message="Cargando perfil docente..." />;
  }

  if (errorMessage !== null) {
    return (
      <PanelMessage
        action={
          <button
            className="rounded-md bg-[var(--gold)] px-4 py-2 text-sm font-semibold text-[#15130c] transition hover:bg-[var(--gold-soft)]"
            onClick={cargarPerfil}
            type="button"
          >
            Reintentar
          </button>
        }
        eyebrow="Perfil no disponible"
        message={errorMessage}
        title="No se pudo cargar el perfil docente"
      />
    );
  }

  if (perfil === null) {
    return <PanelMessage message="Cargando perfil docente..." />;
  }

  return (
    <div className="space-y-5">
      <PerfilDocenteHeader docente={perfil.docente} />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(22rem,0.75fr)]">
        <DatosDocenteCard docente={perfil.docente} />
        <ResumenConstanciasCard constancias={perfil.constancias} />
      </div>

      <ConstanciasTable
        constancias={perfil.constancias}
        detailReturnTo="/perfil-docente"
        emptyMessage="Aun no tienes constancias generadas."
      />
    </div>
  );
}

function PanelMessage({
  action,
  eyebrow,
  message,
  title,
}: {
  action?: ReactNode;
  eyebrow?: string;
  message: string;
  title?: string;
}) {
  return (
    <section
      aria-live="polite"
      className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_18px_45px_rgba(0,0,0,0.18)]"
      role={title ? "alert" : "status"}
    >
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--gold-soft)]">
          {eyebrow}
        </p>
      ) : null}
      {title ? <h2 className="mt-3 text-2xl font-semibold text-[var(--text)]">{title}</h2> : null}
      <p className={title ? "mt-2 text-sm leading-6 text-[var(--muted)]" : "text-sm text-[var(--muted)]"}>
        {message}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </section>
  );
}
