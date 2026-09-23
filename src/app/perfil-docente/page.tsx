import { AppShell } from "@/components/layout/AppShell";
import { PerfilDocenteAccessGuard } from "@/components/docente/PerfilDocenteAccessGuard";
import { TeacherHomeView } from "@/components/docente/TeacherHomeView";

export default function PerfilDocentePage() {
  return (
    <PerfilDocenteAccessGuard>
      <AppShell
        breadcrumb="Docente > Inicio"
        title="Inicio"
        subtitle="Resumen de tu actividad"
      >
        <TeacherHomeView />
      </AppShell>
    </PerfilDocenteAccessGuard>
  );
}
