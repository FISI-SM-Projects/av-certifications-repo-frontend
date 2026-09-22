import { RequireRole } from "@/guards/auth/RequireRole";
import { AppShell } from "@/components/layout/AppShell";
import { TeacherCertificatesView } from "@/components/constancia/TeacherCertificatesView";

export default function ConstanciasPage() {
  return (
    <RequireRole allowedRoles={["DOCENTE"]}>
      <AppShell
        breadcrumb="Sprint 3 > Docente > Constancias"
        title="Mis constancias"
        subtitle="Consulta, visualización y descarga de constancias generadas"
        badges={["Sesion autenticada"]}
      >
        <TeacherCertificatesView />
      </AppShell>
    </RequireRole>
  );
}
