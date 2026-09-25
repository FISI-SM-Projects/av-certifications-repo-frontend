"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";

import { generarConstanciaSemestral } from "@/services/constancia/constanciaService";
import { getAllAuthenticatedTeacherCourses } from "@/services/docente/academicWorkloadService";
import { ConstanciaApiError } from "@/types/constancia/constancia-error.types";
import type {
  CertificateGenerationSummary,
  ExpectedCourseRequest,
  SemesterCertificateRequest,
  SemesterCertificateResponse,
} from "@/types/constancia/constancia.types";
import type { AcademicWorkload } from "@/types/docente/academicWorkload.types";

type SemesterCertificateFormProps = {
  certificates: CertificateGenerationSummary[];
  certificatesError: string | null;
  certificatesLoading: boolean;
  onGenerated: () => Promise<void> | void;
  onRetryCertificates: () => Promise<void> | void;
};

type AcademicPeriodGroup = {
  id: number;
  semesterCode: string;
  workloads: AcademicWorkload[];
};

export function SemesterCertificateForm({
  certificates,
  certificatesError,
  certificatesLoading,
  onGenerated,
  onRetryCertificates,
}: SemesterCertificateFormProps) {
  const [workloads, setWorkloads] = useState<AcademicWorkload[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState("");
  const [isLoadingWorkloads, setIsLoadingWorkloads] = useState(true);
  const [workloadsError, setWorkloadsError] = useState<string | null>(null);
  const [workloadsRetry, setWorkloadsRetry] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [missingCourses, setMissingCourses] = useState<ExpectedCourseRequest[]>([]);
  const [successResponse, setSuccessResponse] = useState<SemesterCertificateResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const periodGroups = useMemo(() => groupWorkloadsByPeriod(workloads), [workloads]);
  const selectedPeriod = periodGroups.find(
    (period) => String(period.id) === selectedPeriodId,
  ) ?? null;
  const workloadStatuses = useMemo(
    () => selectedPeriod?.workloads.map((workload) => ({
      available: isCourseAvailable(workload, certificates),
      workload,
    })) ?? [],
    [certificates, selectedPeriod],
  );
  const availableCount = workloadStatuses.filter((status) => status.available).length;
  const missingCount = workloadStatuses.length - availableCount;
  const hasAllCertificates = workloadStatuses.length > 0 && missingCount === 0;
  const isLoading = isLoadingWorkloads || certificatesLoading;
  const canGenerate = selectedPeriod !== null
    && hasAllCertificates
    && !isLoading
    && workloadsError === null
    && certificatesError === null;

  useEffect(() => {
    let isActive = true;
    const controller = new AbortController();

    void getAllAuthenticatedTeacherCourses(controller.signal)
      .then((nextWorkloads) => {
        if (!isActive) {
          return;
        }

        const nextPeriods = groupWorkloadsByPeriod(nextWorkloads);
        setWorkloads(nextWorkloads);
        setSelectedPeriodId((currentPeriodId) => {
          if (nextPeriods.length === 1) {
            return String(nextPeriods[0].id);
          }

          return nextPeriods.some((period) => String(period.id) === currentPeriodId)
            ? currentPeriodId
            : "";
        });
      })
      .catch(() => {
        if (isActive) {
          setWorkloads([]);
          setSelectedPeriodId("");
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

  function handlePeriodChange(event: ChangeEvent<HTMLSelectElement>) {
    setSelectedPeriodId(event.target.value);
    setErrorMessage(null);
    setMissingCourses([]);
    setSuccessResponse(null);
  }

  function retryWorkloads() {
    setIsLoadingWorkloads(true);
    setWorkloadsError(null);
    setWorkloadsRetry((retry) => retry + 1);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting || !canGenerate || selectedPeriod === null) {
      return;
    }

    setErrorMessage(null);
    setMissingCourses([]);
    setSuccessResponse(null);
    setIsSubmitting(true);

    const request: SemesterCertificateRequest = {
      semester: selectedPeriod.semesterCode,
      expected_courses: buildExpectedCourses(selectedPeriod.workloads),
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
        setErrorMessage("No se pudo generar la constancia semestral. Inténtalo nuevamente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const periodPlaceholder = isLoadingWorkloads
    ? "Cargando períodos académicos..."
    : workloadsError !== null
      ? "Períodos no disponibles"
      : periodGroups.length === 0
        ? "Sin períodos académicos"
        : periodGroups.length > 1
          ? "Selecciona un período"
          : periodGroups[0].semesterCode;

  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.18)]">
      <div className="border-b border-[var(--border-soft)] pb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--gold-soft)]">
          Consolidación semestral
        </p>
        <h3 className="mt-2 text-xl font-semibold text-[var(--text)]">Constancia semestral</h3>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--muted)]">
          Elige un período y revisa si todos sus cursos cuentan con una constancia por curso.
        </p>
      </div>

      <form className="mt-5 space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2 md:max-w-md">
          <label className="text-sm font-semibold text-[var(--text)]" htmlFor="academic-period">
            Período académico
          </label>
          <select
            className="w-full rounded-md border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-sm text-[var(--text)] outline-none transition focus:border-[var(--gold)] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isLoadingWorkloads || workloadsError !== null || periodGroups.length === 0 || isSubmitting}
            id="academic-period"
            onChange={handlePeriodChange}
            value={selectedPeriodId}
          >
            {selectedPeriodId === "" ? <option value="">{periodPlaceholder}</option> : null}
            {periodGroups.map((period) => (
              <option key={period.id} value={period.id}>
                {period.semesterCode}
              </option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <p aria-live="polite" className="text-sm text-[var(--muted)]">
            Cargando información académica...
          </p>
        ) : null}

        {!isLoadingWorkloads && workloadsError !== null ? (
          <FeedbackPanel
            action={(
              <button
                className="rounded-md border border-[var(--border)] px-3 py-2 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--gold)]"
                onClick={retryWorkloads}
                type="button"
              >
                Reintentar
              </button>
            )}
            message={workloadsError}
            title="Carga académica no disponible"
            tone="error"
          />
        ) : null}

        {!certificatesLoading && certificatesError !== null ? (
          <FeedbackPanel
            action={(
              <button
                className="rounded-md border border-[var(--border)] px-3 py-2 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--gold)]"
                onClick={() => void onRetryCertificates()}
                type="button"
              >
                Reintentar
              </button>
            )}
            message="No se pudieron cargar tus constancias."
            title="Constancias no disponibles"
            tone="error"
          />
        ) : null}

        {!isLoadingWorkloads && workloadsError === null && workloads.length === 0 ? (
          <FeedbackPanel
            message="No tienes cursos asignados para generar una constancia semestral."
            title="Sin carga académica"
            tone="warning"
          />
        ) : null}

        {!isLoading && selectedPeriod === null && periodGroups.length > 1 ? (
          <FeedbackPanel
            message="Selecciona un período académico para revisar sus cursos."
            title="Período pendiente"
            tone="warning"
          />
        ) : null}

        {!isLoading && selectedPeriod !== null && certificatesError === null ? (
          <section aria-labelledby="semester-courses-title" className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h4 className="text-base font-semibold text-[var(--text)]" id="semester-courses-title">
                  Cursos asignados
                </h4>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Período {selectedPeriod.semesterCode}
                </p>
              </div>
              <p aria-live="polite" className="text-sm font-semibold text-[var(--text)]">
                {availableCount} de {workloadStatuses.length} constancias disponibles
              </p>
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
              {workloadStatuses.map(({ available, workload }) => (
                <SemesterCourseCard
                  available={available}
                  key={workload.id}
                  workload={workload}
                />
              ))}
            </div>

            {workloadStatuses.length === 0 ? (
              <FeedbackPanel
                message="No tienes cursos asignados en este período."
                title="Sin cursos"
                tone="warning"
              />
            ) : missingCount > 0 ? (
              <FeedbackPanel
                message={`${missingCount === 1 ? "Falta" : "Faltan"} ${missingCount} ${missingCount === 1 ? "constancia por curso" : "constancias por curso"} para generar la constancia semestral.`}
                title="Generación pendiente"
                tone="warning"
              />
            ) : (
              <FeedbackPanel
                message="Todos los cursos del período cuentan con una constancia por curso."
                title="Requisitos completos"
                tone="success"
              />
            )}
          </section>
        ) : null}

        <div aria-live="polite" className="space-y-3">
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
                `Identificador de generación: ${successResponse.generationId}`,
                `Versión: v${String(successResponse.version).padStart(3, "0")}`,
                `Cursos: ${successResponse.courseCount}`,
                `Estado: ${successResponse.status === "APROBADO" ? "Aprobado" : "Generado"}`,
              ]}
              message="Constancia semestral generada correctamente."
              title="Generación exitosa"
              tone="success"
            />
          ) : null}
        </div>

        <div className="flex justify-end border-t border-[var(--border-soft)] pt-5">
          <button
            className="min-h-11 w-full rounded-md bg-[var(--gold)] px-4 py-2 text-sm font-semibold text-[#15130c] transition hover:bg-[var(--gold-soft)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            disabled={isSubmitting || !canGenerate}
            type="submit"
          >
            {isSubmitting ? "Generando constancia semestral..." : "Generar constancia semestral"}
          </button>
        </div>
      </form>
    </section>
  );
}

function groupWorkloadsByPeriod(workloads: AcademicWorkload[]): AcademicPeriodGroup[] {
  const periods = new Map<number, AcademicPeriodGroup>();

  workloads.forEach((workload) => {
    const periodId = workload.academicPeriod.id;
    const period = periods.get(periodId);

    if (period) {
      period.workloads.push(workload);
      return;
    }

    periods.set(periodId, {
      id: periodId,
      semesterCode: workload.academicPeriod.semesterCode,
      workloads: [workload],
    });
  });

  return Array.from(periods.values());
}

function buildExpectedCourses(workloads: AcademicWorkload[]): ExpectedCourseRequest[] {
  const expectedCourses = new Map<string, ExpectedCourseRequest>();

  workloads.forEach((workload) => {
    const code = workload.course.code.trim();
    const section = String(workload.section).trim();
    const key = `${code.toUpperCase()}::${section.toUpperCase()}`;

    if (!expectedCourses.has(key)) {
      expectedCourses.set(key, { code, section });
    }
  });

  return Array.from(expectedCourses.values());
}

function isCourseAvailable(
  workload: AcademicWorkload,
  certificates: CertificateGenerationSummary[],
): boolean {
  return certificates.some((certificate) =>
    certificate.type === "CURSO"
    && certificate.semester === workload.academicPeriod.semesterCode
    && certificate.courseCode === workload.course.code
    && certificate.section === String(workload.section),
  );
}

function SemesterCourseCard({
  available,
  workload,
}: {
  available: boolean;
  workload: AcademicWorkload;
}) {
  const statusClassName = available
    ? "border-[rgba(79,155,97,0.55)] bg-[rgba(79,155,97,0.16)] text-[#b8f0c4]"
    : "border-[rgba(201,168,93,0.55)] bg-[rgba(201,168,93,0.14)] text-[var(--gold-soft)]";

  return (
    <article className="min-w-0 rounded-lg border border-[var(--border-soft)] bg-[var(--surface-soft)] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--gold-soft)]">
            {workload.course.code}
          </p>
          <h5 className="mt-1 break-words text-sm font-semibold leading-6 text-[var(--text)]">
            {workload.course.name}
          </h5>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Sección {workload.section} · Ciclo {workload.cycle} · Plan {workload.plan} · {workload.school}
          </p>
        </div>
        <span className={`inline-flex w-fit shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold ${statusClassName}`}>
          {available ? "Disponible" : "Faltante"}
        </span>
      </div>
    </article>
  );
}

function FeedbackPanel({
  action,
  items,
  message,
  title,
  tone,
}: {
  action?: ReactNode;
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
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}
