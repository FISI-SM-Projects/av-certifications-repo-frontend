import { AppShell } from "@/components/layout/AppShell";

export default function PerfilDocenteLoading() {
  return (
    <AppShell
      breadcrumb="Docente > Inicio"
      title="Inicio"
      subtitle="Cargando resumen"
    >
      <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6">
        <p className="text-sm text-[var(--muted)]">
          Cargando inicio...
        </p>
      </section>
    </AppShell>
  );
}
