import { RequireRole } from "@/components/auth/RequireRole";
import { AppShell } from "@/components/layout/AppShell";
import { CertificateDetailView } from "@/features/constancias/components/CertificateDetailView";

type CertificateDetailPageProps = {
  params: Promise<{
    generationId: string;
  }>;
  searchParams?: Promise<{
    returnTo?: string | string[];
    returnLabel?: string | string[];
  }>;
};

export default async function CertificateDetailPage({
  params,
  searchParams,
}: CertificateDetailPageProps) {
  const { generationId } = await params;
  const query = searchParams ? await searchParams : {};
  const returnTo = Array.isArray(query.returnTo) ? query.returnTo[0] : query.returnTo;

  return (
    <RequireRole allowedRoles={["DOCENTE", "DIRECTOR", "ADMIN"]}>
      <AppShell
        badges={["Simulación Aula Virtual"]}
        breadcrumb="Sprint 3 > Docente > Constancias > Detalle"
        subtitle="Visualización y descarga del documento generado"
        title="Detalle de constancia"
      >
        <CertificateDetailView generationId={generationId} returnTo={returnTo} />
      </AppShell>
    </RequireRole>
  );
}
