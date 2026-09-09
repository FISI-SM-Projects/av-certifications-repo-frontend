import { RequireRole } from "@/guards/auth/RequireRole";
import { AppShell } from "@/components/layout/AppShell";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export default function AdminPage() {
  return (
    <RequireRole allowedRoles={["ADMIN"]}>
      <AppShell
        breadcrumb="Administracion"
        title="Panel de Administracion"
        subtitle="Vista general del sistema y accesos administrativos"
        badges={["ADMIN"]}
      >
        <AdminDashboard />
      </AppShell>
    </RequireRole>
  );
}
