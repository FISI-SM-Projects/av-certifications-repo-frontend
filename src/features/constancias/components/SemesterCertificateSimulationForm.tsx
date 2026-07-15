"use client";

import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";

import { generarConstanciaSemestral } from "@/features/constancias/services/constanciaService";
import { ConstanciaApiError } from "@/features/constancias/types/constancia-error.types";
import type {
  CertificateGenerationSummary,
  ExpectedCourseRequest,
  SemesterCertificateRequest,
  SemesterCertificateResponse,
} from "@/features/constancias/types/constancia.types";

type ExpectedCourseFormRow = {
  id: string;
  code: string;
  section: string;
};

type SemesterCertificateSimulationFormProps = {
  certificates: CertificateGenerationSummary[];
  teacherCode: string;
  onGenerated: () => Promise<void> | void;
};

const INITIAL_ROWS: ExpectedCourseFormRow[] = [
  { id: "course-1", code: "32BGNYGF", section: "1" },
  { id: "course-2", code: "32SW001", section: "2" },
];

export function SemesterCertificateSimulationForm({
  certificates,
  teacherCode,
  onGenerated,
}: SemesterCertificateSimulationFormProps) {
  const [semester, setSemester] = useState("26.1");
  const [rows, setRows] = useState<ExpectedCourseFormRow[]>(INITIAL_ROWS);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [missingCourses, setMissingCourses] = useState<ExpectedCourseRequest[]>([]);
  const [successResponse, setSuccessResponse] = useState<SemesterCertificateResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const rowStatuses = useMemo(
    () => rows.map((row) => ({ rowId: row.id, found: isCourseAvailable(row, semester, teacherCode, certificates) })),
    [certificates, rows, semester, teacherCode],
  );
  const hasMissingCourses = rowStatuses.some((status) => !status.found);
  const hasIncompleteRows = rows.some((row) => row.code.trim() === "" || row.section.trim() === "");
  const isSubmitDisabled =
    isSubmitting
    || teacherCode.trim() === ""
    || semester.trim() === ""
    || rows.length === 0
    || hasIncompleteRows
    || hasMissingCourses;

  function updateRow(rowId: string, field: "code" | "section", value: string) {
    setRows((currentRows) =>
      currentRows.map((row) => (row.id === rowId ? { ...row, [field]: value } : row)),
    );
  }

  function addRow() {
    setRows((currentRows) => [
      ...currentRows,
      { id: `course-${Date.now()}`, code: "", section: "" },
    ]);
  }

  function removeRow(rowId: string) {
    setRows((currentRows) => {
      if (currentRows.length === 1) {
        return currentRows;
      }

      return currentRows.filter((row) => row.id !== rowId);
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setErrorMessage(null);
    setMissingCourses([]);
    setSuccessResponse(null);

    const errors = validateForm(teacherCode, semester, rows);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    if (hasMissingCourses) {
      setValidationErrors(["Todos los cursos esperados deben estar encontrados en el listado actual."]);
      return;
    }

    setValidationErrors([]);
    setIsSubmitting(true);

    const request: SemesterCertificateRequest = {
      teacher_code: teacherCode,
      semester,
      expected_courses: rows.map((row) => ({
        code: row.code,
        section: row.section,
      })),
    };

    try {
      const response = await generarConstanciaSemestral(request);
      setSuccessResponse(response);
      await onGenerated();
    } catch (error) {
      if (error instanceof ConstanciaApiError) {
        setErrorMessage(error.message);
        setMissingCourses(error.missingCourses);
      } else {
        setErrorMessage("No se pudo conectar con el backend de constancias.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.18)]">
      <div className="border-b border-[var(--border-soft)] pb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--gold-soft)]">
          Consolidación semestral
        </p>
        <h3 className="mt-2 text-xl font-semibold text-[var(--text)]">Constancia semestral</h3>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--muted)]">
          Genera una constancia consolidada cuando todos los cursos esperados tengan una
          constancia por curso.
        </p>
      </div>

      <form className="mt-5 space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[var(--text)]" htmlFor="semester-teacher-code">
              Código docente
            </label>
            <input
              className="w-full rounded-md border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-sm text-[var(--text)] read-only:cursor-not-allowed read-only:opacity-75"
              id="semester-teacher-code"
              readOnly
              type="text"
              value={teacherCode}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[var(--text)]" htmlFor="semester-value">
              Semestre
            </label>
            <input
              className="w-full rounded-md border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-sm text-[var(--text)] outline-none transition focus:border-[var(--gold)]"
              id="semester-value"
              onChange={(event: ChangeEvent<HTMLInputElement>) => setSemester(event.target.value)}
              type="text"
              value={semester}
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h4 className="text-base font-semibold text-[var(--text)]">Cursos esperados</h4>
              <p className="mt-1 text-sm text-[var(--muted)]">
                El estado encontrado/faltante se calcula con el listado actual visible.
              </p>
            </div>
            <button
              className="rounded-md border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--gold)] hover:text-[var(--gold-soft)]"
              onClick={addRow}
              type="button"
            >
              Agregar curso
            </button>
          </div>

          <div className="space-y-3">
            {rows.map((row) => {
              const status = rowStatuses.find((item) => item.rowId === row.id);
              return (
                <div
                  className="grid gap-3 rounded-lg border border-[var(--border-soft)] bg-[var(--surface-soft)] p-4 md:grid-cols-[minmax(0,1fr)_minmax(0,0.7fr)_auto_auto]"
                  key={row.id}
                >
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[var(--text)]" htmlFor={`${row.id}-code`}>
                      Código
                    </label>
                    <input
                      className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] outline-none transition focus:border-[var(--gold)]"
                      id={`${row.id}-code`}
                      onChange={(event) => updateRow(row.id, "code", event.target.value)}
                      type="text"
                      value={row.code}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[var(--text)]" htmlFor={`${row.id}-section`}>
                      Sección
                    </label>
                    <input
                      className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] outline-none transition focus:border-[var(--gold)]"
                      id={`${row.id}-section`}
                      onChange={(event) => updateRow(row.id, "section", event.target.value)}
                      type="text"
                      value={row.section}
                    />
                  </div>
                  <div className="flex items-end">
                    <SemesterCourseStatusBadge found={Boolean(status?.found)} />
                  </div>
                  <div className="flex items-end">
                    <button
                      aria-label={`Eliminar curso esperado ${row.code || row.id}`}
                      className="rounded-md border border-[var(--border)] px-3 py-2 text-sm font-semibold text-[var(--muted)] transition hover:border-[var(--gold)] hover:text-[var(--gold-soft)] disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={rows.length === 1}
                      onClick={() => removeRow(row.id)}
                      type="button"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div aria-live="polite" className="space-y-3">
          {semester.trim() === "" || hasIncompleteRows ? (
            <FeedbackPanel
              message="Completa el semestre, el código y la sección de cada curso esperado para continuar."
              title="Datos pendientes"
              tone="warning"
            />
          ) : null}

          {hasMissingCourses && !hasIncompleteRows && semester.trim() !== "" ? (
            <FeedbackPanel
              message="Para generar la constancia semestral, todos los cursos esperados deben tener constancia por curso."
              title="Hay cursos faltantes"
              tone="warning"
            />
          ) : null}

          {validationErrors.length > 0 ? (
            <FeedbackPanel
              items={validationErrors}
              message="Revisa los datos antes de generar la constancia semestral."
              title="Formulario incompleto"
              tone="error"
            />
          ) : null}

          {errorMessage ? (
            <FeedbackPanel
              items={missingCourses.map((course) => `${course.code}, sección ${course.section}`)}
              message={errorMessage}
              title="No se pudo generar la constancia semestral"
              tone="error"
            />
          ) : null}

          {successResponse ? (
            <FeedbackPanel
              items={[
                `ID: ${successResponse.generationId}`,
                `Versión: v${String(successResponse.version).padStart(3, "0")}`,
                `Cursos: ${successResponse.courseCount}`,
                `Estado: ${successResponse.status}`,
              ]}
              message="Constancia semestral generada correctamente."
              title="Generación exitosa"
              tone="success"
            />
          ) : null}
        </div>

        <div className="flex justify-end border-t border-[var(--border-soft)] pt-5">
          <button
            className="rounded-md bg-[var(--gold)] px-4 py-2 text-sm font-semibold text-[#15130c] transition hover:bg-[var(--gold-soft)] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitDisabled}
            type="submit"
          >
            {isSubmitting ? "Generando constancia semestral..." : "Generar constancia semestral"}
          </button>
        </div>
      </form>
    </section>
  );
}

function isCourseAvailable(
  row: ExpectedCourseFormRow,
  semester: string,
  teacherCode: string,
  certificates: CertificateGenerationSummary[],
): boolean {
  const code = row.code.trim();
  const section = row.section.trim();
  const normalizedSemester = semester.trim();

  if (code === "" || section === "" || normalizedSemester === "") {
    return false;
  }

  return certificates.some((certificate) =>
    certificate.type === "CURSO"
    && certificate.teacherCode === teacherCode
    && certificate.semester === normalizedSemester
    && certificate.courseCode === code
    && certificate.section === section,
  );
}

function validateForm(
  teacherCode: string,
  semester: string,
  rows: ExpectedCourseFormRow[],
): string[] {
  const errors: string[] = [];

  if (teacherCode.trim() === "") {
    errors.push("La sesión actual no tiene código docente.");
  }
  if (semester.trim() === "") {
    errors.push("El semestre es obligatorio.");
  }
  if (rows.length === 0) {
    errors.push("Debe existir al menos un curso esperado.");
  }

  rows.forEach((row, index) => {
    if (row.code.trim() === "") {
      errors.push(`Curso ${index + 1}: el código es obligatorio.`);
    }
    if (row.section.trim() === "") {
      errors.push(`Curso ${index + 1}: la sección es obligatoria.`);
    }
  });

  return errors;
}

function SemesterCourseStatusBadge({ found }: { found: boolean }) {
  const className = found
    ? "border-[rgba(79,155,97,0.55)] bg-[rgba(79,155,97,0.16)] text-[#b8f0c4]"
    : "border-[rgba(196,82,82,0.55)] bg-[rgba(196,82,82,0.14)] text-[#f0b8b8]";

  return (
    <span className={`inline-flex rounded-full border px-3 py-2 text-xs font-semibold ${className}`}>
      {found ? "Encontrado" : "Faltante"}
    </span>
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
  tone: "error" | "success" | "warning";
}) {
  const classNameByTone = {
    error: "border-[rgba(196,82,82,0.55)] bg-[rgba(196,82,82,0.12)]",
    success: "border-[rgba(79,155,97,0.55)] bg-[rgba(79,155,97,0.12)]",
    warning: "border-[rgba(201,168,93,0.55)] bg-[rgba(201,168,93,0.12)]",
  };

  return (
    <div className={`rounded-lg border p-4 ${classNameByTone[tone]}`}>
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
