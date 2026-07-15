import { AppShell } from "@/components/layout/AppShell";
import { ConstanciasTable } from "@/features/perfil-docente/components/ConstanciasTable";
import { DatosDocenteCard } from "@/features/perfil-docente/components/DatosDocenteCard";
import { PerfilDocenteAccessGuard } from "@/features/perfil-docente/components/PerfilDocenteAccessGuard";
import { PerfilDocenteHeader } from "@/features/perfil-docente/components/PerfilDocenteHeader";
import { ResumenConstanciasCard } from "@/features/perfil-docente/components/ResumenConstanciasCard";
import { obtenerPerfilDocente } from "@/features/perfil-docente/services/perfilDocenteService";
import { API_BASE_URL } from "@/lib/api";

export default async function PerfilDocentePage() {
  let perfil: Awaited<ReturnType<typeof obtenerPerfilDocente>>;

  try {
    perfil = await obtenerPerfilDocente();
  } catch {
    return (
      <PerfilDocenteAccessGuard>
        <AppShell
          breadcrumb="Sprint 2 > Perfil Docente"
          title="Perfil Docente"
          subtitle="Sistema de Gestión Docente FISI"
          badges={["Demo"]}
        >
          <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_18px_45px_rgba(0,0,0,0.18)]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--gold-soft)]">
              Integracion backend
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-[var(--text)]">
              No se pudo cargar el perfil docente
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Verifica que el backend este activo en
              {" "}
              <span className="font-medium text-[var(--gold-soft)]">
                {API_BASE_URL}
              </span>
              . Luego recarga esta pagina para volver a consultar el perfil.
            </p>
          </section>
        </AppShell>
      </PerfilDocenteAccessGuard>
    );
  }

  return (
    <PerfilDocenteAccessGuard>
      <AppShell
        breadcrumb="Sprint 2 > Perfil Docente"
        title="Perfil Docente"
        subtitle="Sistema de Gestión Docente FISI"
        badges={["Demo"]}
      >
        <PerfilDocenteHeader docente={perfil.docente} />

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(22rem,0.75fr)]">
          <DatosDocenteCard docente={perfil.docente} />
          <ResumenConstanciasCard constancias={perfil.constancias} />
        </div>

        <ConstanciasTable constancias={perfil.constancias} />
      </AppShell>
    </PerfilDocenteAccessGuard>
  );
}
