import type { EstadoConstancia } from "../types/perfilDocente.types";

type EstadoConstanciaBadgeProps = {
  estado: EstadoConstancia;
};

const styles: Record<EstadoConstancia, string> = {
  GENERADO:
    "border-[rgba(224,198,121,0.45)] bg-[rgba(201,168,93,0.16)] text-[var(--gold-soft)]",
  APROBADO:
    "border-[rgba(79,155,97,0.5)] bg-[var(--green-soft)] text-[#9ee0aa]",
};

export function EstadoConstanciaBadge({ estado }: EstadoConstanciaBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${styles[estado]}`}
    >
      {estado}
    </span>
  );
}
