import { AppShell } from "@/components/layout/AppShell";
import { PerfilDocenteAccessGuard } from "@/components/docente/PerfilDocenteAccessGuard";
import { TeacherProfileView } from "@/components/docente/TeacherProfileView";

export default function PerfilDocentePage() {
  return (
    <PerfilDocenteAccessGuard>
      <AppShell
        breadcrumb="Sprint 2 > Perfil Docente"
        title="Perfil docente"
        subtitle="Sistema de Gestión Docente FISI"
      >
        <TeacherProfileView />
      </AppShell>
    </PerfilDocenteAccessGuard>
  );
}
