import { AppHeader } from "@/components/layout/AppHeader";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ConstanciasTable } from "@/features/perfil-docente/components/ConstanciasTable";
import { DatosDocenteCard } from "@/features/perfil-docente/components/DatosDocenteCard";
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
      <div className="min-h-screen bg-[var(--background)] text-[var(--text)] md:grid md:grid-cols-[16rem_1fr]">
        <AppSidebar />
        <div className="min-w-0">
          <AppHeader />
          <main className="p-4 md:p-6">
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
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)] md:grid md:grid-cols-[16rem_1fr]">
      <AppSidebar />
      <div className="min-w-0">
        <AppHeader />
        <main className="space-y-5 p-4 md:p-6">
          <PerfilDocenteHeader docente={perfil.docente} />

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(22rem,0.75fr)]">
            <DatosDocenteCard docente={perfil.docente} />
            <ResumenConstanciasCard constancias={perfil.constancias} />
          </div>

          <ConstanciasTable constancias={perfil.constancias} />
        </main>
      </div>
    </div>
  );
}
