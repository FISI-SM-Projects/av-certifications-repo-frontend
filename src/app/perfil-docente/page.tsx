import { AppShell } from "@/components/layout/AppShell";
import { PerfilDocenteAccessGuard } from "@/components/docente/PerfilDocenteAccessGuard";
import { TeacherProfileView } from "@/components/docente/TeacherProfileView";

export default function PerfilDocentePage() {
  return (
    <PerfilDocenteAccessGuard>
      <AppShell
        breadcrumb="Sprint 2 > Perfil Docente"
        title="Perfil Docente"
        subtitle="Sistema de Gestion Docente FISI"
        badges={["Sesion simulada"]}
      >
        <TeacherProfileView />
      </AppShell>
    </PerfilDocenteAccessGuard>
  );
}
