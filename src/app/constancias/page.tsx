import { RequireRole } from "@/components/auth/RequireRole";
import { AppShell } from "@/components/layout/AppShell";
import { TeacherCertificatesView } from "@/features/constancias/components/TeacherCertificatesView";

export default function ConstanciasPage() {
  return (
    <RequireRole allowedRoles={["DOCENTE", "ADMIN"]}>
      <AppShell
        breadcrumb="Sprint 3 > Docente > Constancias"
        title="Mis constancias"
        subtitle="Consulta, visualización y descarga de constancias generadas"
        badges={["Simulación Aula Virtual"]}
      >
        <TeacherCertificatesView />
      </AppShell>
    </RequireRole>
  );
}
