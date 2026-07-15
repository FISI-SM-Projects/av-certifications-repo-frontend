import { RequireRole } from "@/components/auth/RequireRole";
import { AppShell } from "@/components/layout/AppShell";
import { DepartmentTeachersTable } from "@/features/director/components/DepartmentTeachersTable";

export default function DirectorDocentesPage() {
  return (
    <RequireRole allowedRoles={["DIRECTOR", "ADMIN"]}>
      <AppShell
        breadcrumb="Sprint 2 > Dirección > Docentes"
        title="Docentes del departamento"
        subtitle="Consulta por Departamento Académico"
        badges={["Sesión simulada"]}
      >
        <DepartmentTeachersTable />
      </AppShell>
    </RequireRole>
  );
}
