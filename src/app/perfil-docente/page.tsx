import { AppHeader } from "@/components/layout/AppHeader";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ConstanciasTable } from "@/features/perfil-docente/components/ConstanciasTable";
import { DatosDocenteCard } from "@/features/perfil-docente/components/DatosDocenteCard";
import { PerfilDocenteHeader } from "@/features/perfil-docente/components/PerfilDocenteHeader";
import { obtenerPerfilDocente } from "@/features/perfil-docente/services/perfilDocenteService";

export default async function PerfilDocentePage() {
  const perfil = await obtenerPerfilDocente();
  const aprobadas = perfil.constancias.filter(
    (constancia) => constancia.estado === "APROBADO",
  ).length;
  const generadas = perfil.constancias.filter(
    (constancia) => constancia.estado === "GENERADO",
  ).length;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)] md:grid md:grid-cols-[16rem_1fr]">
      <AppSidebar />
      <div className="min-w-0">
        <AppHeader />
        <main className="space-y-5 p-4 md:p-6">
          <PerfilDocenteHeader docente={perfil.docente} />

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
              <p className="text-xs font-semibold uppercase text-[var(--muted)]">
                Total constancias
              </p>
              <p className="mt-3 text-3xl font-semibold">{perfil.constancias.length}</p>
            </div>
            <div className="rounded-lg border border-[rgba(201,168,93,0.35)] bg-[rgba(201,168,93,0.1)] p-4">
              <p className="text-xs font-semibold uppercase text-[var(--gold-soft)]">
                Generadas
              </p>
              <p className="mt-3 text-3xl font-semibold text-[var(--gold-soft)]">
                {generadas}
              </p>
            </div>
            <div className="rounded-lg border border-[rgba(79,155,97,0.4)] bg-[var(--green-soft)] p-4">
              <p className="text-xs font-semibold uppercase text-[#a6d8af]">
                Aprobadas
              </p>
              <p className="mt-3 text-3xl font-semibold text-[#b7efc1]">
                {aprobadas}
              </p>
            </div>
          </div>

          <DatosDocenteCard docente={perfil.docente} />
          <ConstanciasTable constancias={perfil.constancias} />
        </main>
      </div>
    </div>
  );
}
