"use client";

import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";

import type { UsuarioSesion } from "@/features/auth/types/auth.types";
import { generarConstanciaCurso } from "@/features/constancias/services/constanciaService";
import { ConstanciaApiError } from "@/features/constancias/types/constancia-error.types";
import type {
  CourseCertificateRequest,
  CourseCertificateResponse,
} from "@/features/constancias/types/constancia.types";

type CourseFormState = {
  code: string;
  subject: string;
  cycle: string;
  section: string;
  school: string;
  plan: string;
  semester: string;
};

type IssuerFormState = {
  system: string;
  executed_by_userid: string;
  executed_by_email: string;
};

type FormField = {
  id: string;
  label: string;
  value: string;
  readOnly?: boolean;
  onChange?: (value: string) => void;
};

type CourseCertificateSimulationFormProps = {
  user: UsuarioSesion;
  teacherCode: string;
  onCancel: () => void;
  onGenerated: () => Promise<void> | void;
};

const INITIAL_COURSE_STATE: CourseFormState = {
  code: "32BGNYGF",
  subject: "Ingeniería y Gestión de Proyectos",
  cycle: "7",
  section: "1",
  school: "SW",
  plan: "2023",
  semester: "26.1",
};

const INITIAL_ISSUER_STATE: IssuerFormState = {
  system: "moodle",
  executed_by_userid: "demo-user-001",
  executed_by_email: "usuario.demo@unmsm.edu.pe",
};

const FIELD_LABELS: Record<string, string> = {
  "teacher.full_name": "Nombre completo del docente",
  "teacher.email": "Correo institucional del docente",
  "teacher.teacher_code": "Código docente",
  "course.code": "Código del curso",
  "course.subject": "Nombre del curso",
  "course.cycle": "Ciclo",
  "course.section": "Sección",
  "course.school": "Escuela",
  "course.plan": "Plan",
  "course.semester": "Semestre",
  "issuer.system": "Sistema emisor",
  "issuer.executed_by_userid": "Usuario ejecutor",
  "issuer.executed_by_email": "Correo del ejecutor",
};

export function CourseCertificateSimulationForm({
  user,
  teacherCode,
  onCancel,
  onGenerated,
}: CourseCertificateSimulationFormProps) {
  const [course, setCourse] = useState<CourseFormState>(INITIAL_COURSE_STATE);
  const [issuer, setIssuer] = useState<IssuerFormState>(INITIAL_ISSUER_STATE);
  const [validationMissingFields, setValidationMissingFields] = useState<string[]>([]);
  const [apiMissingFields, setApiMissingFields] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [successResponse, setSuccessResponse] = useState<CourseCertificateResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const teacherFields = useMemo<FormField[]>(
    () => [
      {
        id: "teacher-full-name",
        label: "Nombre completo",
        value: user.fullName,
        readOnly: true,
      },
      {
        id: "teacher-email",
        label: "Correo institucional",
        value: user.email,
        readOnly: true,
      },
      {
        id: "teacher-code",
        label: "Código docente",
        value: teacherCode,
        readOnly: true,
      },
    ],
    [teacherCode, user.email, user.fullName],
  );

  const courseFields: FormField[] = [
    {
      id: "course-code",
      label: "Código del curso",
      value: course.code,
      onChange: (value) => updateCourseField("code", value),
    },
    {
      id: "course-subject",
      label: "Nombre del curso",
      value: course.subject,
      onChange: (value) => updateCourseField("subject", value),
    },
    {
      id: "course-cycle",
      label: "Ciclo",
      value: course.cycle,
      onChange: (value) => updateCourseField("cycle", value),
    },
    {
      id: "course-section",
      label: "Sección",
      value: course.section,
      onChange: (value) => updateCourseField("section", value),
    },
    {
      id: "course-school",
      label: "Escuela",
      value: course.school,
      onChange: (value) => updateCourseField("school", value),
    },
    {
      id: "course-plan",
      label: "Plan",
      value: course.plan,
      onChange: (value) => updateCourseField("plan", value),
    },
    {
      id: "course-semester",
      label: "Semestre",
      value: course.semester,
      onChange: (value) => updateCourseField("semester", value),
    },
  ];

  const issuerFields: FormField[] = [
    {
      id: "issuer-system",
      label: "Sistema",
      value: issuer.system,
      readOnly: true,
      onChange: (value) => updateIssuerField("system", value),
    },
    {
      id: "issuer-userid",
      label: "Usuario ejecutor",
      value: issuer.executed_by_userid,
      onChange: (value) => updateIssuerField("executed_by_userid", value),
    },
    {
      id: "issuer-email",
      label: "Correo del ejecutor",
      value: issuer.executed_by_email,
      onChange: (value) => updateIssuerField("executed_by_email", value),
    },
  ];

  function updateCourseField(field: keyof CourseFormState, value: string) {
    setCourse((current) => ({ ...current, [field]: value }));
  }

  function updateIssuerField(field: keyof IssuerFormState, value: string) {
    setIssuer((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setErrorMessage(null);
    setErrorStatus(null);
    setSuccessResponse(null);
    setApiMissingFields([]);

    const validationErrors = validateForm(user, teacherCode, course, issuer);

    if (validationErrors.length > 0) {
      setValidationMissingFields(validationErrors);
      return;
    }

    setValidationMissingFields([]);
    setIsSubmitting(true);

    const request: CourseCertificateRequest = {
      teacher: {
        full_name: user.fullName,
        email: user.email,
        teacher_code: teacherCode,
      },
      course: {
        code: course.code,
        subject: course.subject,
        cycle: course.cycle,
        section: course.section,
        school: course.school,
        plan: course.plan,
        semester: course.semester,
      },
      issuer: {
        system: issuer.system,
        executed_by_userid: issuer.executed_by_userid,
        executed_by_email: issuer.executed_by_email,
      },
    };

    try {
      const response = await generarConstanciaCurso(request);
      setSuccessResponse(response);
      await onGenerated();
    } catch (error) {
      if (error instanceof ConstanciaApiError) {
        setErrorMessage(error.message);
        setErrorStatus(error.status > 0 ? error.status : null);
        setApiMissingFields(error.missingFields);
      } else {
        setErrorMessage("No se pudo conectar con el backend de constancias.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.18)]">
      <div className="flex flex-col gap-3 border-b border-[var(--border-soft)] pb-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--gold-soft)]">
            Simulación Aula Virtual
          </p>
          <h3 className="mt-2 text-xl font-semibold text-[var(--text)]">
            Recepción de constancia por curso
          </h3>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--muted)]">
            Este formulario construye el mismo JSON que enviaría Aula Virtual. Los datos del
            docente vienen de la sesión y no son editables.
          </p>
        </div>
        <button
          className="rounded-md border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--gold)] hover:text-[var(--gold-soft)]"
          onClick={onCancel}
          type="button"
        >
          Cerrar
        </button>
      </div>

      <form className="mt-5 space-y-6" onSubmit={handleSubmit}>
        <FormSection description="Identidad usada para generar la constancia." title="Datos del docente">
          {teacherFields.map((field) => (
            <TextField field={field} key={field.id} />
          ))}
        </FormSection>

        <FormSection
          description="Valores demo editables. Todos se envían como texto al backend."
          title="Datos del curso"
        >
          {courseFields.map((field) => (
            <TextField field={field} key={field.id} />
          ))}
        </FormSection>

        <FormSection description="Información visible del sistema que simula el envío." title="Datos del emisor simulado">
          {issuerFields.map((field) => (
            <TextField field={field} key={field.id} />
          ))}
        </FormSection>

        <div aria-live="polite" className="space-y-3">
          {validationMissingFields.length > 0 ? (
            <FeedbackPanel
              items={validationMissingFields.map((field) => FIELD_LABELS[field] ?? field)}
              message="Completa los campos obligatorios antes de generar la constancia."
              title="Campos faltantes"
              tone="error"
            />
          ) : null}

          {errorMessage ? (
            <FeedbackPanel
              items={apiMissingFields.length > 0 ? apiMissingFields : undefined}
              message={errorStatus ? `${errorMessage} (HTTP ${errorStatus})` : errorMessage}
              title="No se pudo generar la constancia"
              tone="error"
            />
          ) : null}

          {successResponse ? (
            <FeedbackPanel
              items={[
                `ID: ${successResponse.generationId}`,
                `Versión: v${String(successResponse.version).padStart(3, "0")}`,
                `Estado: ${successResponse.status}`,
              ]}
              message="Constancia generada correctamente."
              title="Generación exitosa"
              tone="success"
            />
          ) : null}
        </div>

        <div className="flex flex-col gap-3 border-t border-[var(--border-soft)] pt-5 sm:flex-row sm:justify-end">
          <button
            className="rounded-md border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--gold)] hover:text-[var(--gold-soft)]"
            disabled={isSubmitting}
            onClick={onCancel}
            type="button"
          >
            Cancelar
          </button>
          <button
            className="rounded-md bg-[var(--gold)] px-4 py-2 text-sm font-semibold text-[#15130c] transition hover:bg-[var(--gold-soft)] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Generando constancia..." : "Generar constancia por curso"}
          </button>
        </div>
      </form>
    </section>
  );
}

function FormSection({
  children,
  description,
  title,
}: {
  children: React.ReactNode;
  description: string;
  title: string;
}) {
  return (
    <fieldset className="rounded-lg border border-[var(--border-soft)] p-4">
      <legend className="px-2 text-sm font-semibold text-[var(--gold-soft)]">{title}</legend>
      <p className="mb-4 text-sm text-[var(--muted)]">{description}</p>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{children}</div>
    </fieldset>
  );
}

function TextField({ field }: { field: FormField }) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    field.onChange?.(event.target.value);
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-[var(--text)]" htmlFor={field.id}>
        {field.label}
      </label>
      <input
        className="w-full rounded-md border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-sm text-[var(--text)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--gold)] read-only:cursor-not-allowed read-only:opacity-75"
        id={field.id}
        onChange={handleChange}
        readOnly={field.readOnly}
        type="text"
        value={field.value}
      />
    </div>
  );
}

function FeedbackPanel({
  items,
  message,
  title,
  tone,
}: {
  items?: string[];
  message: string;
  title: string;
  tone: "error" | "success";
}) {
  const className =
    tone === "success"
      ? "border-[rgba(79,155,97,0.55)] bg-[rgba(79,155,97,0.12)]"
      : "border-[rgba(196,82,82,0.55)] bg-[rgba(196,82,82,0.12)]";

  return (
    <div className={`rounded-lg border p-4 ${className}`}>
      <p className="text-sm font-semibold text-[var(--text)]">{title}</p>
      <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{message}</p>
      {items && items.length > 0 ? (
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[var(--muted)]">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function validateForm(
  user: UsuarioSesion,
  teacherCode: string,
  course: CourseFormState,
  issuer: IssuerFormState,
): string[] {
  const requiredValues: Array<[string, string | null]> = [
    ["teacher.full_name", user.fullName],
    ["teacher.email", user.email],
    ["teacher.teacher_code", teacherCode],
    ["course.code", course.code],
    ["course.subject", course.subject],
    ["course.cycle", course.cycle],
    ["course.section", course.section],
    ["course.school", course.school],
    ["course.plan", course.plan],
    ["course.semester", course.semester],
    ["issuer.system", issuer.system],
    ["issuer.executed_by_userid", issuer.executed_by_userid],
    ["issuer.executed_by_email", issuer.executed_by_email],
  ];

  return requiredValues
    .filter(([, value]) => value === null || value.trim() === "")
    .map(([field]) => field);
}
