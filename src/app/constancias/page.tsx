import { RequireRole } from "@/guards/auth/RequireRole";
import { AppShell } from "@/components/layout/AppShell";
import { TeacherCertificatesView } from "@/components/constancia/TeacherCertificatesView";

export default function ConstanciasPage() {
  return (
    <RequireRole allowedRoles={["DOCENTE", "ADMIN"]}>
      <AppShell
        breadcrumb="Docente > Constancias"
        title="Mis constancias"
        subtitle="Consulta, visualización y descarga de constancias generadas"
      >
        <TeacherCertificatesView />
      </AppShell>
    </RequireRole>
  );
}
