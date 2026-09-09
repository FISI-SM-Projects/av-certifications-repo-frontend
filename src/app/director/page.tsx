import { RequireRole } from "@/guards/auth/RequireRole";
import { AppShell } from "@/components/layout/AppShell";
import { DirectorDashboard } from "@/components/director/DirectorDashboard";

export default function DirectorPage() {
  return (
    <RequireRole allowedRoles={["DIRECTOR", "ADMIN"]}>
      <AppShell
        breadcrumb="Dirección"
        title="Dashboard de Dirección"
        subtitle="Resumen institucional por rol"
      >
        <DirectorDashboard />
      </AppShell>
    </RequireRole>
  );
}
