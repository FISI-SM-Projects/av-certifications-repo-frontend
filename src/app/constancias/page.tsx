import { RequireRole } from "@/guards/auth/RequireRole";
import { AppShell } from "@/components/layout/AppShell";
import { TeacherCertificatesView } from "@/components/constancia/TeacherCertificatesView";

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
