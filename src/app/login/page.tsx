import { RealLoginForm } from "@/components/auth/RealLoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--text)] sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center">
        <div className="grid w-full gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <section className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface-muted)] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--gold-soft)]">
              Gestion Docente FISI
            </p>
            <h1 className="mt-4 text-3xl font-semibold leading-tight text-[var(--text)]">
              Acceso al sistema
            </h1>
            <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
              Autenticacion institucional con Spring Security, LDAP y token JWT.
            </p>
          </section>

          <RealLoginForm />
        </div>
      </div>
    </main>
  );
}
