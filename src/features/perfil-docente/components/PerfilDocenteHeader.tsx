import type { Docente } from "../types/perfilDocente.types";

type PerfilDocenteHeaderProps = {
  docente: Docente;
};

export function PerfilDocenteHeader({ docente }: PerfilDocenteHeaderProps) {
  return (
    <section className="rounded-lg border border-[var(--border)] bg-[linear-gradient(135deg,rgba(90,15,36,0.98),rgba(59,10,24,0.98))] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.2)]">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-md border border-[var(--gold)] bg-[rgba(201,168,93,0.12)] text-xl font-bold text-[var(--gold-soft)]">
            JP
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
              Perfil institucional
            </p>
            <h3 className="mt-1 text-2xl font-semibold text-[var(--text)]">
              {docente.nombres} {docente.apellidos}
            </h3>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {docente.correoInstitucional}
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[36rem]">
          <div className="rounded-md border border-[var(--border-soft)] bg-[rgba(27,5,12,0.72)] p-3">
            <p className="text-xs text-[var(--muted)]">Departamento Académico</p>
            <p className="mt-1 font-semibold">{docente.departamentoAcademico}</p>
          </div>
          <div className="rounded-md border border-[rgba(143,41,69,0.55)] bg-[rgba(90,15,36,0.42)] p-3">
            <p className="text-xs text-[var(--muted)]">Estado de datos</p>
            <p className="mt-1 font-semibold text-[var(--text)]">Datos simulados</p>
          </div>
          <div className="rounded-md border border-[rgba(201,168,93,0.42)] bg-[rgba(201,168,93,0.1)] p-3">
            <p className="text-xs text-[var(--gold-soft)]">Condición</p>
            <p className="mt-1 font-semibold text-[var(--gold-soft)]">
              {docente.condicion}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
