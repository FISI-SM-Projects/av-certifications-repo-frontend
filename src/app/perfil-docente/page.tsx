import { AppShell } from "@/components/layout/AppShell";
import { PerfilDocenteAccessGuard } from "@/features/perfil-docente/components/PerfilDocenteAccessGuard";
import { TeacherProfileView } from "@/features/perfil-docente/components/TeacherProfileView";

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
