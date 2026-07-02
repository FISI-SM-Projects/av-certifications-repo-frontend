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
    <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)]">
      <div className="border-b border-[var(--border)] px-5 py-4">
        <h3 className="text-base font-semibold">Datos generales</h3>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Información principal para la pantalla de Perfil Docente.
        </p>
      </div>

      <dl className="grid gap-px overflow-hidden rounded-b-lg bg-[var(--border-soft)] sm:grid-cols-2 xl:grid-cols-4">
        {fields.map(([label, value]) => (
          <div className="bg-[var(--surface)] p-4" key={label}>
            <dt className="text-xs font-semibold uppercase text-[var(--muted)]">
              {label}
            </dt>
            <dd className="mt-2 min-h-6 text-sm font-medium text-[var(--text)]">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
