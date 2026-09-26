import type { Metadata } from "next";

import { RequireRole } from "@/guards/auth/RequireRole";
import { AppShell } from "@/components/layout/AppShell";
import { DirectorDashboard } from "@/components/director/DirectorDashboard";

export const metadata: Metadata = {
  title: "Dirección",
};

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
