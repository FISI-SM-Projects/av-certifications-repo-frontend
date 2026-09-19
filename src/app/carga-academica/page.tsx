import { TeacherAcademicWorkloadView } from "@/components/docente/TeacherAcademicWorkloadView";
import { AppShell } from "@/components/layout/AppShell";
import { RequireRole } from "@/guards/auth/RequireRole";

export default function CargaAcademicaPage() {
  return (
    <RequireRole allowedRoles={["DOCENTE"]}>
      <AppShell
        breadcrumb="Docente > Carga académica"
        subtitle="Cursos asignados"
        title="Carga académica"
      >
        <TeacherAcademicWorkloadView />
      </AppShell>
    </RequireRole>
  );
}
