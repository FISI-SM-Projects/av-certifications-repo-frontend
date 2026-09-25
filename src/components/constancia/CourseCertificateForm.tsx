"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";

import { generarConstanciaCurso } from "@/services/constancia/constanciaService";
import { getAllAuthenticatedTeacherCourses } from "@/services/docente/academicWorkloadService";
import { ConstanciaApiError } from "@/types/constancia/constancia-error.types";
import type {
  CourseCertificateRequest,
  CourseCertificateResponse,
} from "@/types/constancia/constancia.types";
import type { AcademicWorkload } from "@/types/docente/academicWorkload.types";

type CourseCertificateFormProps = {
  onCancel: () => void;
  onGenerated: () => Promise<void> | void;
};

const SOURCE_SYSTEM = "moodle";

const FIELD_LABELS: Record<string, string> = {
  "course.code": "Código del curso",
  "course.subject": "Nombre del curso",
  "course.cycle": "Ciclo",
  "course.section": "Sección",
  "course.school": "Escuela",
  "course.plan": "Plan",
  "course.semester": "Semestre",
  source_system: "Sistema emisor",
};

export function CourseCertificateForm({
  onCancel,
  onGenerated,
}: CourseCertificateFormProps) {
  const [workloads, setWorkloads] = useState<AcademicWorkload[]>([]);
  const [selectedWorkloadId, setSelectedWorkloadId] = useState("");
  const [isLoadingWorkloads, setIsLoadingWorkloads] = useState(true);
  const [workloadsError, setWorkloadsError] = useState<string | null>(null);
  const [workloadsRetry, setWorkloadsRetry] = useState(0);
  const [apiMissingFields, setApiMissingFields] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successResponse, setSuccessResponse] = useState<CourseCertificateResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedWorkload = workloads.find(
    (workload) => String(workload.id) === selectedWorkloadId,
  ) ?? null;
  const selectedMissingFields = selectedWorkload === null
    ? []
    : validateWorkload(selectedWorkload);
  const canGenerate = selectedWorkload !== null
    && selectedMissingFields.length === 0
    && !isLoadingWorkloads
    && workloadsError === null;

  useEffect(() => {
    let isActive = true;
    const controller = new AbortController();

    void getAllAuthenticatedTeacherCourses(controller.signal)
      .then((nextWorkloads) => {
        if (isActive) {
          setWorkloads(nextWorkloads);
        }
      })
      .catch(() => {
        if (isActive) {
          setWorkloads([]);
          setSelectedWorkloadId("");
          setWorkloadsError("No se pudo cargar tu carga académica.");
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoadingWorkloads(false);
        }
      });

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [workloadsRetry]);

  function handleWorkloadChange(event: ChangeEvent<HTMLSelectElement>) {
    setSelectedWorkloadId(event.target.value);
    setErrorMessage(null);
    setSuccessResponse(null);
    setApiMissingFields([]);
  }

  function retryWorkloads() {
    setIsLoadingWorkloads(true);
    setWorkloadsError(null);
    setWorkloadsRetry((retry) => retry + 1);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting || !canGenerate || selectedWorkload === null) {
      return;
    }

    setErrorMessage(null);
    setSuccessResponse(null);
    setApiMissingFields([]);
    setIsSubmitting(true);

    const request: CourseCertificateRequest = {
      course: {
        code: selectedWorkload.course.code,
        subject: selectedWorkload.course.name,
        cycle: String(selectedWorkload.cycle),
        section: String(selectedWorkload.section),
        school: selectedWorkload.school,
        plan: String(selectedWorkload.plan),
        semester: selectedWorkload.academicPeriod.semesterCode,
      },
      source_system: SOURCE_SYSTEM,
    };

    try {
      const response = await generarConstanciaCurso(request);
      setSuccessResponse(response);
      await onGenerated();
    } catch (error) {
      if (error instanceof ConstanciaApiError) {
        setErrorMessage(error.message);
        setApiMissingFields(error.missingFields);
      } else {
        setErrorMessage("No se pudo generar la constancia. Inténtalo nuevamente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const selectPlaceholder = isLoadingWorkloads
    ? "Cargando cursos asignados..."
    : workloadsError !== null
      ? "Cursos no disponibles"
      : workloads.length === 0
        ? "Sin cursos asignados"
        : "Selecciona un curso";

  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.18)]">
      <div className="flex flex-col gap-3 border-b border-[var(--border-soft)] pb-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--gold-soft)]">
            Generación de constancia
          </p>
          <h3 className="mt-2 text-xl font-semibold text-[var(--text)]">
            Constancia por curso
          </h3>
        </div>
        <button
          className="control-focus rounded-md border border-[var(--control-border)] px-4 py-2 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--gold)] hover:text-[var(--gold-soft)]"
          onClick={onCancel}
          type="button"
        >
          Cerrar
        </button>
      </div>

      <form className="mt-5 space-y-6" onSubmit={handleSubmit}>
        <fieldset className="rounded-lg border border-[var(--border-soft)] p-4">
          <legend className="px-2 text-sm font-semibold text-[var(--gold-soft)]">
            Curso asignado
          </legend>
          <p className="mb-4 text-sm text-[var(--muted)]">
            Selecciona una asignación de tu carga académica para generar la constancia.
          </p>

          <div className="space-y-2">
            <label
              className="text-sm font-semibold text-[var(--text)]"
              htmlFor="academic-workload"
            >
              Curso
            </label>
            <select
              className="control-focus w-full rounded-md border border-[var(--control-border)] bg-[var(--surface-soft)] px-3 py-2 text-sm text-[var(--text)] transition disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isLoadingWorkloads || workloadsError !== null || workloads.length === 0}
              id="academic-workload"
              onChange={handleWorkloadChange}
              value={selectedWorkloadId}
            >
              <option value="">{selectPlaceholder}</option>
              {workloads.map((workload) => (
                <option key={workload.id} value={workload.id}>
                  {formatWorkloadOption(workload)}
                </option>
              ))}
            </select>
          </div>

          {isLoadingWorkloads ? (
            <p aria-live="polite" className="mt-4 text-sm text-[var(--muted)]">
              Cargando cursos asignados...
            </p>
          ) : null}

          {!isLoadingWorkloads && workloadsError !== null ? (
            <div className="mt-4 rounded-lg border border-[rgba(196,82,82,0.55)] bg-[rgba(196,82,82,0.12)] p-4">
              <p className="text-sm text-[var(--muted)]">{workloadsError}</p>
              <button
                className="control-focus mt-3 rounded-md border border-[var(--control-border)] px-3 py-2 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--gold)]"
                onClick={retryWorkloads}
                type="button"
              >
                Reintentar
              </button>
            </div>
          ) : null}

          {!isLoadingWorkloads && workloadsError === null && workloads.length === 0 ? (
            <p className="mt-4 text-sm text-[var(--muted)]">
              No tienes cursos asignados disponibles para generar una constancia.
            </p>
          ) : null}
        </fieldset>

        {selectedWorkload !== null ? (
          <WorkloadSummary workload={selectedWorkload} />
        ) : null}

        <div aria-live="polite" className="space-y-3">
          {selectedMissingFields.length > 0 ? (
            <FeedbackPanel
              items={selectedMissingFields.map((field) => FIELD_LABELS[field] ?? field)}
              message="La asignación seleccionada no contiene todos los datos necesarios."
              title="Datos académicos incompletos"
              tone="error"
            />
          ) : null}

          {errorMessage ? (
            <FeedbackPanel
              items={apiMissingFields.length > 0 ? apiMissingFields.map((field) => FIELD_LABELS[field] ?? field) : undefined}
              message={errorMessage}
              title="No se pudo generar la constancia"
              tone="error"
            />
          ) : null}

          {successResponse ? (
            <FeedbackPanel
              items={[
                `Identificador de generación: ${successResponse.generationId}`,
                `Versión: v${String(successResponse.version).padStart(3, "0")}`,
                `Estado: ${successResponse.status === "APROBADO" ? "Aprobado" : "Generado"}`,
              ]}
              message="Constancia generada correctamente."
              title="Generación exitosa"
              tone="success"
            />
          ) : null}
        </div>

        <div className="flex flex-col gap-3 border-t border-[var(--border-soft)] pt-5 sm:flex-row sm:justify-end">
          <button
            className="control-focus rounded-md border border-[var(--control-border)] px-4 py-2 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--gold)] hover:text-[var(--gold-soft)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-[var(--control-border)] disabled:hover:text-[var(--text)]"
            disabled={isSubmitting}
            onClick={onCancel}
            type="button"
          >
            Cancelar
          </button>
          <button
            className="control-focus rounded-md bg-[var(--gold)] px-4 py-2 text-sm font-semibold text-[#15130c] transition hover:bg-[var(--gold-soft)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-[var(--gold)]"
            disabled={isSubmitting || !canGenerate}
            type="submit"
          >
            {isSubmitting ? "Generando constancia..." : "Generar constancia por curso"}
          </button>
        </div>
      </form>
    </section>
  );
}

function WorkloadSummary({ workload }: { workload: AcademicWorkload }) {
  const fields = [
    { label: "Curso", value: workload.course.name },
    { label: "Código", value: workload.course.code },
    { label: "Período", value: workload.academicPeriod.semesterCode },
    { label: "Sección", value: workload.section },
    { label: "Ciclo", value: workload.cycle },
    { label: "Escuela", value: workload.school },
    { label: "Plan", value: workload.plan },
  ];

  return (
    <section
      aria-labelledby="selected-workload-summary"
      className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface-soft)] p-4"
    >
      <h4
        className="text-sm font-semibold text-[var(--gold-soft)]"
        id="selected-workload-summary"
      >
        Datos de la asignación
      </h4>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Revisa la información que aparecerá en la constancia.
      </p>
      <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {fields.map((field) => (
          <div key={field.label} className="min-w-0">
            <dt className="text-xs font-medium text-[var(--muted)]">{field.label}</dt>
            <dd className="mt-1 break-words text-sm font-semibold text-[var(--text)]">
              {field.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function formatWorkloadOption(workload: AcademicWorkload): string {
  const course = [workload.course.code.trim(), workload.course.name.trim()]
    .filter(Boolean)
    .join(" — ");
  const assignment = [
    `Sección ${workload.section}`,
    workload.academicPeriod.semesterCode.trim(),
  ].filter(Boolean);

  return [course || "Asignación académica", ...assignment].join(" — ");
}

function validateWorkload(workload: AcademicWorkload): string[] {
  const requiredValues: Array<[string, string]> = [
    ["course.code", workload.course.code],
    ["course.subject", workload.course.name],
    ["course.cycle", String(workload.cycle)],
    ["course.section", String(workload.section)],
    ["course.school", workload.school],
    ["course.plan", String(workload.plan)],
    ["course.semester", workload.academicPeriod.semesterCode],
    ["source_system", SOURCE_SYSTEM],
  ];

  return requiredValues
    .filter(([, value]) => value.trim() === "")
    .map(([field]) => field);
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
