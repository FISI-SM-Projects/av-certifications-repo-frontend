import type { EstadoConstancia } from "@/types/docente/perfilDocente.types";
import { displayCertificateStatus, isSignedStatus } from "@/utils/constancia/certificateStatus";

type EstadoConstanciaBadgeProps = {
  estado: EstadoConstancia;
};

const styles: Partial<Record<EstadoConstancia, string>> = {
  GENERADA:
    "border-[rgba(224,198,121,0.5)] bg-[rgba(201,168,93,0.16)] text-[var(--gold-soft)]",
  GENERADO:
    "border-[rgba(224,198,121,0.5)] bg-[rgba(201,168,93,0.16)] text-[var(--gold-soft)]",
  FIRMADA:
    "border-[rgba(79,155,97,0.55)] bg-[var(--green-soft)] text-[#9ee0aa]",
  APROBADO:
    "border-[rgba(79,155,97,0.55)] bg-[var(--green-soft)] text-[#9ee0aa]",
};

export function EstadoConstanciaBadge({ estado }: EstadoConstanciaBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${styles[estado] ?? (isSignedStatus(estado) ? "border-[rgba(79,155,97,0.55)] bg-[var(--green-soft)] text-[#9ee0aa]" : "border-[var(--border)] text-[var(--text)]")}`}
    >
      {displayCertificateStatus(estado)}
    </span>
  );
}
