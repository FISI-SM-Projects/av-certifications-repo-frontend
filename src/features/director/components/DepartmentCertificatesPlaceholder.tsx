const demoCertificates = [
  {
    docente: "Juan Carlos Pérez Gómez",
    curso: "Arquitectura de Software",
    semestre: "2026-I",
    estado: "GENERADO",
  },
  {
    docente: "María Elena Torres Rojas",
    curso: "Ingeniería de Requisitos",
    semestre: "2026-I",
    estado: "GENERADO",
  },
];

export function DepartmentCertificatesPlaceholder() {
  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-[rgba(201,168,93,0.42)] bg-[rgba(201,168,93,0.08)] p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--gold-soft)]">
          Próximo sprint
        </p>
        <h3 className="mt-2 text-xl font-semibold text-[var(--text)]">
          Flujo de revisión preparado
        </h3>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
          Esta pantalla reserva el espacio para revisar y aprobar constancias generadas por
          docentes del departamento. La aprobación real, firma, PDF y trazabilidad se
          implementarán en un sprint posterior.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--gold-soft)]">
            Constancias simuladas
          </p>
          <p className="mt-3 text-3xl font-semibold text-[var(--text)]">
            {demoCertificates.length}
          </p>
        </article>
        <article className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--gold-soft)]">
            Pendientes
          </p>
          <p className="mt-3 text-sm font-semibold text-[var(--muted)]">Sprint futuro</p>
        </article>
        <article className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--gold-soft)]">
            Aprobación
          </p>
          <p className="mt-3 text-sm font-semibold text-[var(--muted)]">No funcional todavía</p>
        </article>
      </section>

      <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)]">
        <div className="border-b border-[var(--border)] px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--gold-soft)]">
            Constancias del departamento
          </p>
          <h3 className="mt-1 text-base font-semibold">Tabla simulada</h3>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Datos visuales de referencia. No se consume backend en esta pantalla.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[rgba(25,36,30,0.95)] text-[var(--muted)]">
                <th className="px-5 py-3 font-semibold">Docente</th>
                <th className="px-5 py-3 font-semibold">Curso</th>
                <th className="px-5 py-3 font-semibold">Semestre</th>
                <th className="px-5 py-3 font-semibold">Estado</th>
                <th className="px-5 py-3 text-right font-semibold">Acción</th>
              </tr>
            </thead>
            <tbody>
              {demoCertificates.map((certificate) => (
                <tr
                  className="border-b border-[var(--border-soft)] transition hover:bg-[rgba(25,36,30,0.86)]"
                  key={`${certificate.docente}-${certificate.curso}`}
                >
                  <td className="px-5 py-4 font-medium text-[var(--text)]">
                    {certificate.docente}
                  </td>
                  <td className="px-5 py-4 text-[var(--muted)]">{certificate.curso}</td>
                  <td className="px-5 py-4 font-semibold text-[var(--gold-soft)]">
                    {certificate.semestre}
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded-full border border-[rgba(201,168,93,0.35)] bg-[rgba(201,168,93,0.08)] px-3 py-1 text-xs font-semibold text-[var(--gold-soft)]">
                      {certificate.estado}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      disabled
                      title="Disponible en el Sprint de aprobación"
                      className="inline-flex cursor-not-allowed rounded-md border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-xs font-semibold text-[var(--muted)] opacity-65"
                    >
                      Aprobar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
