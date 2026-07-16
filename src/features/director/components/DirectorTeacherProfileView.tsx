"use client";

import { useEffect, useState } from "react";

import { ConstanciasTable } from "@/features/perfil-docente/components/ConstanciasTable";
import { DatosDocenteCard } from "@/features/perfil-docente/components/DatosDocenteCard";
import { PerfilDocenteHeader } from "@/features/perfil-docente/components/PerfilDocenteHeader";
import { ResumenConstanciasCard } from "@/features/perfil-docente/components/ResumenConstanciasCard";
import { obtenerPerfilDocentePorCodigo } from "@/features/director/services/directorService";
import type { PerfilDocenteResponse } from "@/features/perfil-docente/types/perfilDocente.types";

type DirectorTeacherProfileViewProps = {
  teacherCode: string;
};

export function DirectorTeacherProfileView({ teacherCode }: DirectorTeacherProfileViewProps) {
  const [perfil, setPerfil] = useState<PerfilDocenteResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function cargarPerfil() {
      try {
        setIsLoading(true);
        setError(null);
        const perfilDocente = await obtenerPerfilDocentePorCodigo(teacherCode);

        if (isMounted) {
          setPerfil(perfilDocente);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "No se pudo cargar el perfil del docente",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    cargarPerfil();

    return () => {
      isMounted = false;
    };
  }, [teacherCode]);

  if (isLoading) {
    return (
      <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
        <p className="text-sm text-[var(--muted)]">Cargando perfil en modo consulta...</p>
      </section>
    );
  }

  if (error !== null) {
    return (
      <section className="rounded-lg border border-red-900/50 bg-[var(--danger-soft)] p-5 text-sm text-red-100">
        {error}
      </section>
    );
  }

  if (perfil === null) {
    return null;
  }

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-[rgba(201,168,93,0.42)] bg-[rgba(201,168,93,0.08)] p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--gold-soft)]">
          Modo consulta
        </p>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Vista de director. Esta pantalla no permite edición ni aprobación de constancias.
        </p>
      </section>

      <PerfilDocenteHeader docente={perfil.docente} />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(22rem,0.75fr)]">
        <DatosDocenteCard docente={perfil.docente} />
        <ResumenConstanciasCard constancias={perfil.constancias} />
      </div>

      <ConstanciasTable
        constancias={perfil.constancias}
        detailReturnTo={`/director/docentes/${encodeURIComponent(teacherCode)}`}
        emptyMessage="Este docente aun no tiene constancias generadas."
      />
    </div>
  );
}
