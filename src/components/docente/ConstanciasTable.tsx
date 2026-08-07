import { CertificateSummaryTable } from "@/components/constancia/CertificateSummaryTable";
import type { ConstanciaPerfil } from "@/types/docente/perfilDocente.types";

type ConstanciasTableProps = {
  constancias: ConstanciaPerfil[];
  detailReturnTo?: string;
  emptyMessage?: string;
};

export function ConstanciasTable({
  constancias,
  detailReturnTo,
  emptyMessage = "Aun no tienes constancias generadas.",
}: ConstanciasTableProps) {
  return (
    <CertificateSummaryTable
      certificates={constancias}
      detailReturnTo={detailReturnTo}
      emptyMessage={emptyMessage}
    />
  );
}
