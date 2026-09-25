import type { Metadata } from "next";

import { RequireRole } from "@/guards/auth/RequireRole";
import { AppShell } from "@/components/layout/AppShell";
import { TeacherCertificatesView } from "@/components/constancia/TeacherCertificatesView";

export const metadata: Metadata = {
  title: "Mis constancias",
};

export default function ConstanciasPage() {
  return (
    <RequireRole allowedRoles={["DOCENTE"]}>
      <AppShell
        breadcrumb="Sprint 3 > Docente > Constancias"
        title="Mis constancias"
        subtitle="Consulta, visualización y descarga de constancias generadas"
      >
        <TeacherCertificatesView />
      </AppShell>
    </RequireRole>
  );
}
