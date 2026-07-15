import { AppShell } from "@/components/layout/AppShell";

export default function PerfilDocenteLoading() {
  return (
    <AppShell
      breadcrumb="Sprint 2 > Perfil Docente"
      title="Perfil Docente"
      subtitle="Sistema de Gestión Docente FISI"
      badges={["Demo"]}
    >
      <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6">
        <p className="text-sm text-[var(--muted)]">
          Cargando perfil docente...
        </p>
      </section>
    </AppShell>
  );
}
