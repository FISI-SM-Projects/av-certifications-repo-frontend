import { AppHeader } from "@/components/layout/AppHeader";
import { AppSidebar } from "@/components/layout/AppSidebar";

export default function PerfilDocenteLoading() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)] md:grid md:grid-cols-[16rem_1fr]">
      <AppSidebar />
      <div className="min-w-0">
        <AppHeader />
        <main className="p-4 md:p-6">
          <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6">
            <p className="text-sm text-[var(--muted)]">
              Cargando perfil docente...
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}
