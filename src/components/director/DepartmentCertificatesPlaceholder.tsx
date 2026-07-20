import Link from "next/link";

export function DepartmentCertificatesPlaceholder() {
  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-[rgba(201,168,93,0.42)] bg-[rgba(201,168,93,0.08)] p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--gold-soft)]">
          Sprint 4
        </p>
        <h3 className="mt-2 text-xl font-semibold text-[var(--text)]">
          Gestion de constancias del director
        </h3>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
          Esta funcion se implementara en el Sprint 4, cuando se definan las reglas de
          revision y aprobacion.
        </p>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
          Mientras tanto, consulta las constancias reales desde el perfil de cada docente.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--gold-soft)]">
            Revision departamental
          </p>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            Pendiente de reglas funcionales de aprobacion.
          </p>
        </article>
        <article className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--gold-soft)]">
            Datos reales
          </p>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            Disponibles actualmente en el perfil consultado de cada docente.
          </p>
        </article>
        <article className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--gold-soft)]">
            Accion
          </p>
          <Link
            className="mt-3 inline-flex rounded-md bg-[var(--gold)] px-4 py-2 text-sm font-semibold text-[#15130c] transition hover:bg-[var(--gold-soft)]"
            href="/director/docentes"
          >
            Ir a docentes
          </Link>
        </article>
      </section>
    </div>
  );
}
