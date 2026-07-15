import { DemoLoginSelector } from "@/features/auth/components/DemoLoginSelector";

export default function LoginDemoPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--text)] sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center">
        <div className="grid w-full gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <section className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface-muted)] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--gold-soft)]">
              Gestión Docente FISI
            </p>
            <h1 className="mt-4 text-3xl font-semibold leading-tight text-[var(--text)]">
              Autenticación y roles simulados
            </h1>
            <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
              Usa usuarios demo para validar el flujo de rol, departamento académico y redirección
              inicial del Sprint 2.
            </p>
            <div className="mt-6 rounded-md border border-[var(--border)] bg-[var(--background-deep)] p-4 text-sm text-[var(--muted)]">
              Esta sesión es solo funcional para desarrollo. No representa seguridad real ni reemplaza
              LDAP, JWT o Spring Security.
            </div>
          </section>

          <DemoLoginSelector />
        </div>
      </div>
    </main>
  );
}
