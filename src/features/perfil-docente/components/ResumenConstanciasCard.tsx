import type { Constancia } from "../types/perfilDocente.types";
import { MetricCard } from "./MetricCard";

type ResumenConstanciasCardProps = {
  constancias: Constancia[];
};

export function ResumenConstanciasCard({ constancias }: ResumenConstanciasCardProps) {
  const generadas = constancias.filter(
    (constancia) => constancia.estado === "GENERADO",
  ).length;
  const aprobadas = constancias.filter(
    (constancia) => constancia.estado === "APROBADO",
  ).length;
  const ultimoPeriodo = constancias[0]?.periodo ?? "Sin periodo";

  return (
    <section className="h-full rounded-lg border border-[var(--border)] bg-[var(--surface)]">
      <div className="border-b border-[var(--border)] px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--gold-soft)]">
          Resumen
        </p>
        <h3 className="mt-1 text-base font-semibold">Constancias del Sprint 1</h3>
      </div>
      <div className="grid gap-3 p-4 sm:grid-cols-2">
        <MetricCard label="Total constancias" value={constancias.length} />
        <MetricCard label="Generadas" value={generadas} tone="gold" />
        <MetricCard label="Aprobadas" value={aprobadas} tone="green" />
        <MetricCard label="Último periodo" value={ultimoPeriodo} />
      </div>
    </section>
  );
}
