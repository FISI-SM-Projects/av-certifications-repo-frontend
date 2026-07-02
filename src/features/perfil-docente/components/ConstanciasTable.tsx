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
          <h3 className="text-base font-semibold">Constancias generadas</h3>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Documentos simulados asociados al docente.
          </p>
        </div>
        <span className="w-fit rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--muted)]">
          {constancias.length}/2 registradas
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[rgba(201,168,93,0.9)] text-[#172116]">
              <th className="px-5 py-3 font-bold">Título</th>
              <th className="px-5 py-3 font-bold">Periodo</th>
              <th className="px-5 py-3 font-bold">Estado</th>
              <th className="px-5 py-3 font-bold">Fecha de generación</th>
              <th className="px-5 py-3 text-right font-bold">Acción</th>
            </tr>
          </thead>
          <tbody>
            {constancias.map((constancia) => (
              <tr
                className="border-b border-[var(--border-soft)] transition hover:bg-[var(--surface-soft)]"
                key={constancia.id}
              >
                <td className="px-5 py-4 font-medium">{constancia.titulo}</td>
                <td className="px-5 py-4 text-[var(--gold-soft)]">
                  {constancia.periodo}
                </td>
                <td className="px-5 py-4">
                  <EstadoConstanciaBadge estado={constancia.estado} />
                </td>
                <td className="px-5 py-4 text-[var(--muted)]">
                  {formatDate(constancia.fechaGeneracion)}
                </td>
                <td className="px-5 py-4 text-right">
                  <a
                    className="inline-flex rounded-md border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-xs font-semibold text-[var(--gold-soft)] transition hover:border-[var(--gold)] hover:bg-[rgba(201,168,93,0.12)]"
                    href={constancia.archivoUrl}
                  >
                    Ver PDF
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
