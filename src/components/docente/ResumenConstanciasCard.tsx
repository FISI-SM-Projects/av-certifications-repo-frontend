import type { ConstanciaPerfil } from "@/types/docente/perfilDocente.types";

type ResumenConstanciasCardProps = {
  constancias: ConstanciaPerfil[];
};

export function ResumenConstanciasCard({ constancias }: ResumenConstanciasCardProps) {
  const generadas = constancias.filter(
    (constancia) => constancia.status === "GENERADO",
  ).length;
  const aprobadas = constancias.filter(
    (constancia) => constancia.status === "APROBADO",
  ).length;
  const ultimoPeriodo = constancias[0]?.semester ?? "Sin periodo";

  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_14px_36px_rgba(0,0,0,0.14)]">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--gold-soft)]">
          Resumen del periodo
        </p>
        <h3 className="mt-1 text-lg font-semibold text-[var(--text)]">
          Estado de constancias
        </h3>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total constancias" value={constancias.length} />
        <MetricCard label="Generadas" value={generadas} />
        <MetricCard label="Aprobadas" value={aprobadas} />
        <MetricCard label="Ultimo periodo" value={ultimoPeriodo} />
      </div>
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <article className="rounded-md border border-[var(--border-soft)] bg-[var(--surface-soft)] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-3 break-words text-2xl font-semibold text-[var(--gold-soft)]">{value}</p>
    </article>
  );
}
