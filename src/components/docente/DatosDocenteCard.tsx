import type { Docente } from "@/types/docente/perfilDocente.types";

type DatosDocenteCardProps = {
  docente: Docente;
};

type Field = {
  label: string;
  value: string;
};

type FieldGroup = {
  title: string;
  fields: Field[];
};

export function DatosDocenteCard({ docente }: DatosDocenteCardProps) {
  const groups: FieldGroup[] = [
    {
      title: "Identificacion",
      fields: [
        { label: "Codigo", value: docente.codigo },
        { label: "Nombres", value: docente.nombres },
        { label: "Apellidos", value: docente.apellidos },
      ],
    },
    {
      title: "Contacto academico",
      fields: [
        { label: "Correo institucional", value: docente.correoInstitucional },
        { label: "Departamento academico", value: docente.departamentoAcademico },
      ],
    },
    {
      title: "Vinculo institucional",
      fields: [
        { label: "Categoria", value: docente.categoria },
        { label: "Condicion", value: docente.condicion },
        { label: "Estado", value: "Activo" },
      ],
    },
  ];

  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-[0_14px_36px_rgba(0,0,0,0.14)]">
      <div className="border-b border-[var(--border)] px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--gold-soft)]">
          Datos generales
        </p>
        <h3 className="mt-1 text-lg font-semibold text-[var(--text)]">
          Informacion del docente
        </h3>
      </div>

      <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
        {groups.map((group) => (
          <article
            className="rounded-md border border-[var(--border-soft)] bg-[var(--surface-soft)] p-4"
            key={group.title}
          >
            <h4 className="text-sm font-semibold text-[var(--text)]">{group.title}</h4>
            <dl className="mt-4 space-y-3">
              {group.fields.map((field) => (
                <div key={field.label}>
                  <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
                    {field.label}
                  </dt>
                  <dd className="mt-1 break-words text-sm font-medium text-[var(--text)]">
                    {field.value}
                  </dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}
