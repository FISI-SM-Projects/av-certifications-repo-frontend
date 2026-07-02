import type { Docente } from "../types/perfilDocente.types";

type PerfilDocenteHeaderProps = {
  docente: Docente;
};

export function PerfilDocenteHeader({ docente }: PerfilDocenteHeaderProps) {
  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.16)]">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-md border border-[var(--gold)] bg-[rgba(201,168,93,0.12)] text-lg font-bold text-[var(--gold-soft)]">
            JP
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
              Docente
            </p>
            <h3 className="mt-1 text-2xl font-semibold text-[var(--text)]">
              {docente.nombres} {docente.apellidos}
            </h3>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {docente.correoInstitucional}
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[28rem]">
          <div className="rounded-md border border-[var(--border-soft)] bg-[var(--surface-soft)] p-3">
            <p className="text-xs text-[var(--muted)]">Departamento Académico</p>
            <p className="mt-1 font-semibold">{docente.departamentoAcademico}</p>
          </div>
          <div className="rounded-md border border-[rgba(79,155,97,0.4)] bg-[var(--green-soft)] p-3">
            <p className="text-xs text-[#9fc7a8]">Estado de datos</p>
            <p className="mt-1 font-semibold text-[#b7efc1]">Datos simulados</p>
          </div>
        </div>
      </div>
    </section>
  );
}
