import { RequireRole } from "@/guards/auth/RequireRole";
import { AppShell } from "@/components/layout/AppShell";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { isDemoMode } from "@/lib/uiMode";

export default function AdminPage() {
  const isDemo = isDemoMode();

  return (
    <RequireRole allowedRoles={["ADMIN"]}>
      <AppShell
        breadcrumb="Sprint 2 > Administracion"
        title="Panel de Administracion"
        subtitle={
          isDemo
            ? "Vista general del sistema y accesos administrativos simulados"
            : "Vista general del sistema y accesos administrativos"
        }
        badges={["ADMIN", "Sesion simulada"]}
      >
        <AdminDashboard />
      </AppShell>
    </RequireRole>
  );
}
