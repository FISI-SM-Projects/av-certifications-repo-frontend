import type { ConstanciaPerfil } from "../types/perfilDocente.types";

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
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="Total constancias" value={constancias.length} />
      <MetricCard label="Generadas" value={generadas} />
      <MetricCard label="Aprobadas" value={aprobadas} />
      <MetricCard label="Último periodo" value={ultimoPeriodo} />
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <article className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-3 text-2xl font-semibold text-[var(--gold-soft)]">{value}</p>
    </article>
  );
}
