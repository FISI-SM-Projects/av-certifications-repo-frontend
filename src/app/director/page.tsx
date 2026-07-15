import { RequireRole } from "@/components/auth/RequireRole";
import { AppShell } from "@/components/layout/AppShell";
import { DirectorDashboard } from "@/features/director/components/DirectorDashboard";

export default function DirectorPage() {
  return (
    <RequireRole allowedRoles={["DIRECTOR", "ADMIN"]}>
      <AppShell
        breadcrumb="Sprint 2 > Dirección"
        title="Dashboard de Dirección"
        subtitle="Resumen institucional por rol"
        badges={["Sesión simulada"]}
      >
        <DirectorDashboard />
      </AppShell>
    </RequireRole>
  );
}
