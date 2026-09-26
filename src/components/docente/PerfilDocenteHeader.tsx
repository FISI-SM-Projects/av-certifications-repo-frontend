import { DemoOnly } from "@/components/demo/DemoOnly";
import type { Docente } from "@/types/docente/perfilDocente.types";
import type { TeacherProfile } from "@/types/docente/teacherProfile.types";

type PerfilDocenteHeaderProps = {
  docente: Docente | TeacherProfile;
};

export function PerfilDocenteHeader({ docente }: PerfilDocenteHeaderProps) {
  const isBackendTeacher = "firstName" in docente;
  const firstName = isBackendTeacher ? docente.firstName : docente.nombres;
  const lastName = isBackendTeacher
    ? [docente.paternalLastName, docente.maternalLastName].filter(Boolean).join(" ")
    : docente.apellidos;
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  return (
    <section className="rounded-lg border border-[var(--border)] bg-[linear-gradient(135deg,rgba(90,15,36,0.98),rgba(59,10,24,0.98))] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.2)]">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-md border border-[var(--gold)] bg-[rgba(201,168,93,0.12)] text-xl font-bold text-[var(--gold-soft)]">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
              Perfil institucional
            </p>
            <h2 className="mt-1 text-2xl font-semibold leading-tight text-[var(--text)]">
              {firstName} {lastName}
            </h2>
            {!isBackendTeacher ? (
              <p className="mt-1 break-words text-sm text-[var(--muted)]">
                {docente.correoInstitucional}
              </p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[34rem] lg:grid-cols-4">
          <HeaderBadge label="Rol" value="DOCENTE" />
          <HeaderBadge label="Departamento" value={isBackendTeacher ? docente.department ?? "No registrado" : docente.departamentoAcademico} />
          <HeaderBadge
            label="Estado"
            value={isBackendTeacher ? docente.registerState : "Activo"}
            tone={!isBackendTeacher || docente.registerState === "ACTIVO" ? "success" : "default"}
          />
          {!isBackendTeacher ? (
            <DemoOnly>
              <HeaderBadge label="Estado de datos" value="Datos simulados" />
            </DemoOnly>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function HeaderBadge({
  label,
  tone = "default",
  value,
}: {
  label: string;
  tone?: "default" | "success";
  value: string;
}) {
  const className =
    tone === "success"
      ? "border-[rgba(79,155,97,0.55)] bg-[rgba(79,155,97,0.16)] text-[#b8f0c4]"
      : "border-[var(--border-soft)] bg-[rgba(27,5,12,0.72)] text-[var(--text)]";

  return (
    <div className={`rounded-md border p-3 ${className}`}>
      <p className="text-xs text-[var(--muted)]">{label}</p>
      <p className="mt-1 break-words font-semibold leading-snug">{value}</p>
    </div>
  );
}
