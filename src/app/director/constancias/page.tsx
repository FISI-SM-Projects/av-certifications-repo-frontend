import { RequireRole } from "@/guards/auth/RequireRole";
import { AppShell } from "@/components/layout/AppShell";
import { DepartmentCertificatesPlaceholder } from "@/components/director/DepartmentCertificatesPlaceholder";

export default function DirectorConstanciasPage() {
  return (
    <RequireRole allowedRoles={["DIRECTOR", "ADMIN"]}>
      <AppShell
        breadcrumb="Sprint 2 > Director > Constancias"
        title="Constancias del Departamento"
        subtitle="Revisión y aprobación de constancias generadas por docentes"
        badges={["Placeholder", "Sprint futuro"]}
      >
        <DepartmentCertificatesPlaceholder />
      </AppShell>
    </RequireRole>
  );
}
