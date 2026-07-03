import type { Constancia } from "../types/perfilDocente.types";
import { EstadoConstanciaBadge } from "./EstadoConstanciaBadge";

type ConstanciasTableProps = {
  constancias: Constancia[];
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

export function ConstanciasTable({ constancias }: ConstanciasTableProps) {
  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)]">
      <div className="flex flex-col gap-3 border-b border-[var(--border)] px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--gold-soft)]">
            Documentos
          </p>
          <h3 className="mt-1 text-base font-semibold">Constancias generadas</h3>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Documentos simulados asociados al docente durante el Sprint 1.
          </p>
        </div>
        <span className="w-fit rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--muted)]">
          {constancias.length} registros
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[rgba(25,36,30,0.95)] text-[var(--muted)]">
              <th className="px-5 py-3 font-semibold">Constancia</th>
              <th className="px-5 py-3 font-semibold">Periodo</th>
              <th className="px-5 py-3 font-semibold">Estado</th>
              <th className="px-5 py-3 font-semibold">Fecha de generación</th>
              <th className="px-5 py-3 text-right font-semibold">Acción</th>
            </tr>
          </thead>
          <tbody>
            {constancias.map((constancia) => (
              <tr
                className="border-b border-[var(--border-soft)] transition hover:bg-[rgba(25,36,30,0.86)]"
                key={constancia.id}
              >
                <td className="px-5 py-4">
                  <p className="font-medium text-[var(--text)]">{constancia.titulo}</p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    Archivo simulado: {constancia.archivoUrl}
                  </p>
                </td>
                <td className="px-5 py-4 font-semibold text-[var(--gold-soft)]">
                  {constancia.periodo}
                </td>
                <td className="px-5 py-4">
                  <EstadoConstanciaBadge estado={constancia.estado} />
                </td>
                <td className="px-5 py-4 text-[var(--muted)]">
                  {formatDate(constancia.fechaGeneracion)}
                </td>
                <td className="px-5 py-4 text-right">
                  <button
                    className="inline-flex cursor-not-allowed rounded-md border border-[rgba(201,168,93,0.35)] bg-[rgba(201,168,93,0.08)] px-3 py-2 text-xs font-semibold text-[var(--gold-soft)] opacity-80"
                    title="Disponible en integración futura"
                    type="button"
                    aria-disabled="true"
                  >
                    Ver PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
