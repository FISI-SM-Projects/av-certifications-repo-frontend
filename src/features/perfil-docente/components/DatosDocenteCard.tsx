import type { Docente } from "../types/perfilDocente.types";

type DatosDocenteCardProps = {
  docente: Docente;
};

export function DatosDocenteCard({ docente }: DatosDocenteCardProps) {
  const fields = [
    ["Código", docente.codigo],
    ["Nombres", docente.nombres],
    ["Apellidos", docente.apellidos],
    ["Correo institucional", docente.correoInstitucional],
    ["Departamento Académico", docente.departamentoAcademico],
    ["Categoría", docente.categoria],
    ["Condición", docente.condicion],
  ];

  return (
    <section className="h-full rounded-lg border border-[var(--border)] bg-[var(--surface)]">
      <div className="border-b border-[var(--border)] px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--gold-soft)]">
          Docente
        </p>
        <h3 className="mt-1 text-base font-semibold">Datos generales</h3>
      </div>

      <dl className="divide-y divide-[var(--border-soft)]">
        {fields.map(([label, value]) => (
          <div className="grid gap-1 px-5 py-3.5 sm:grid-cols-[12rem_1fr]" key={label}>
            <dt className="text-xs font-semibold uppercase text-[var(--muted)]">
              {label}
            </dt>
            <dd className="text-sm font-medium text-[var(--text)]">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
