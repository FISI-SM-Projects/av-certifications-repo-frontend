import { RequireRole } from "@/guards/auth/RequireRole";
import { AppShell } from "@/components/layout/AppShell";
import { DepartmentTeachersTable } from "@/components/director/DepartmentTeachersTable";

export default function DirectorDocentesPage() {
  return (
    <RequireRole allowedRoles={["DIRECTOR", "ADMIN"]}>
      <AppShell
        breadcrumb="Dirección > Docentes"
        title="Docentes del departamento"
        subtitle="Consulta por Departamento Académico"
      >
        <DepartmentTeachersTable />
      </AppShell>
    </RequireRole>
  );
}
