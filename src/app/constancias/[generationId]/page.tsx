import { RequireRole } from "@/components/auth/RequireRole";
import { AppShell } from "@/components/layout/AppShell";
import { CertificateDetailView } from "@/features/constancias/components/CertificateDetailView";

type CertificateDetailPageProps = {
  params: Promise<{
    generationId: string;
  }>;
};

export default async function CertificateDetailPage({ params }: CertificateDetailPageProps) {
  const { generationId } = await params;

  return (
    <RequireRole allowedRoles={["DOCENTE", "ADMIN"]}>
      <AppShell
        badges={["Simulación Aula Virtual"]}
        breadcrumb="Sprint 3 > Docente > Constancias > Detalle"
        subtitle="Visualización y descarga del documento generado"
        title="Detalle de constancia"
      >
        <CertificateDetailView generationId={generationId} />
      </AppShell>
    </RequireRole>
  );
}
