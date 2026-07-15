import { RequireRole } from "@/components/auth/RequireRole";
import { AppShell } from "@/components/layout/AppShell";
import { DirectorTeacherProfileView } from "@/features/director/components/DirectorTeacherProfileView";

type DirectorDocentePerfilPageProps = {
  params: Promise<{
    teacherCode: string;
  }>;
};

export default async function DirectorDocentePerfilPage({
  params,
}: DirectorDocentePerfilPageProps) {
  const { teacherCode } = await params;

  return (
    <RequireRole allowedRoles={["DIRECTOR", "ADMIN"]}>
      <AppShell
        breadcrumb="Sprint 2 > Dirección > Perfil docente"
        title="Perfil docente en consulta"
        subtitle="Vista de director"
        badges={["Modo consulta"]}
      >
        <DirectorTeacherProfileView teacherCode={teacherCode} />
      </AppShell>
    </RequireRole>
  );
}
