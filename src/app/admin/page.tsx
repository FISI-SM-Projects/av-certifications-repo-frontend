import { RequireRole } from "@/components/auth/RequireRole";
import { AppShell } from "@/components/layout/AppShell";
import { AdminDashboard } from "@/features/admin/components/AdminDashboard";

export default function AdminPage() {
  return (
    <RequireRole allowedRoles={["ADMIN"]}>
      <AppShell
        breadcrumb="Sprint 2 > Administracion"
        title="Panel de Administracion"
        subtitle="Vista general del sistema y accesos administrativos simulados"
        badges={["ADMIN", "Sesion simulada"]}
      >
        <AdminDashboard />
      </AppShell>
    </RequireRole>
  );
}
