"use client";

import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";

import { generarConstanciaSemestral } from "@/services/constancia/constanciaService";
import { ConstanciaApiError } from "@/types/constancia/constancia-error.types";
import type {
  CertificateGenerationSummary,
  SemesterCertificateRequest,
} from "@/types/constancia/constancia.types";
import type { AcademicWorkload } from "@/types/docente/workload.types";
import { isSignedStatus, isUsableCertificateStatus } from "@/utils/constancia/certificateStatus";

type SemesterCertificateGenerationFormProps = {
  certificates: CertificateGenerationSummary[];
  teacherCode: string;
  workloads?: AcademicWorkload[];
  onGenerated: () => Promise<void> | void;
};

export function SemesterCertificateGenerationForm({
  certificates,
  teacherCode,
  workloads = [],
  onGenerated,
}: SemesterCertificateGenerationFormProps) {
  const availableSemesters = useMemo(() => buildAvailableSemesters(certificates), [certificates]);
  const [selectedSemester, setSelectedSemester] = useState(availableSemesters[0]?.semester ?? "");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [requiresIncompleteConfirmation, setRequiresIncompleteConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeSemester = selectedSemester || availableSemesters[0]?.semester || "";
  const selectedSummary = availableSemesters.find((item) => item.semester === activeSemester);
  const semesterCertificate = selectedSummary?.semesterCertificate ?? null;
  const semesterIsApproved = semesterCertificate ? isSignedStatus(semesterCertificate.status) : false;
  const expectedWorkloadCount = workloads.filter((workload) => workload.academicPeriod === activeSemester).length;
  const hasIncompleteSemesterSource = selectedSummary !== undefined && expectedWorkloadCount > selectedSummary.count;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (teacherCode.trim() === "" || activeSemester.trim() === "") {
      setErrorMessage("Seleccione un periodo con constancias por curso disponibles.");
      return;
    }

    if (semesterIsApproved) {
      setErrorMessage("La constancia semestral para este periodo ya fue firmada y no puede regenerarse.");
      return;
    }

    if (hasIncompleteSemesterSource && !requiresIncompleteConfirmation) {
      setErrorMessage(null);
      setSuccessMessage(null);
      setRequiresIncompleteConfirmation(true);
      return;
    }

    const request: SemesterCertificateRequest = {
      teacher_code: teacherCode,
      semester: activeSemester,
      expected_courses: [],
      confirmIncomplete: requiresIncompleteConfirmation,
    };

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await generarConstanciaSemestral(request);
      setSuccessMessage(semesterCertificate?.generationId === response.generationId
        ? "No se genero una nueva version porque no hay cambios academicos respecto a la version vigente."
        : `Constancia semestral ${response.generationId} generada correctamente.`);
      setRequiresIncompleteConfirmation(false);
      await onGenerated();
    } catch (error) {
      if (error instanceof ConstanciaApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("No se pudo conectar con el backend de constancias.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.18)]">
      <div className="flex flex-col gap-4 border-b border-[var(--border-soft)] pb-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--gold-soft)]">
            Consolidacion semestral
          </p>
          <h3 className="mt-2 text-xl font-semibold text-[var(--text)]">Constancia semestral</h3>
          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
            Genera una constancia consolidada con las constancias por curso existentes del mismo periodo.
          </p>
        </div>
        {selectedSummary ? (
          <div className="rounded-md border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--muted)]">
            <span className="font-semibold text-[var(--text)]">{selectedSummary.count}</span>{" "}
            constancias por curso disponibles
            {selectedSummary.semesterCertificate ? (
              <span className="mt-1 block text-[var(--gold-soft)]">
                {isSignedStatus(selectedSummary.semesterCertificate.status)
                  ? "Constancia semestral firmada"
                  : "Constancia semestral vigente regenerable"}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>

      <form className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between" onSubmit={handleSubmit}>
        <div className="grid flex-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[var(--text)]" htmlFor="semester-teacher-code">
              Codigo docente
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
              Periodo academico
            </label>
            <select
              className="w-full rounded-md border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-sm text-[var(--text)] outline-none transition focus:border-[var(--gold)]"
              disabled={availableSemesters.length === 0 || isSubmitting}
              id="semester-value"
              onChange={(event: ChangeEvent<HTMLSelectElement>) => {
                setSelectedSemester(event.target.value);
                setRequiresIncompleteConfirmation(false);
              }}
              value={activeSemester}
            >
              {availableSemesters.length === 0 ? (
                <option value="">Sin periodos disponibles</option>
              ) : (
                availableSemesters.map((item) => (
                  <option key={item.semester} value={item.semester}>
                    {item.semester}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
        <button
          className="min-h-11 w-full rounded-md bg-[var(--gold)] px-4 py-2 text-sm font-semibold text-[#15130c] transition hover:bg-[var(--gold-soft)] disabled:cursor-not-allowed disabled:opacity-60 lg:w-auto"
          disabled={isSubmitting || activeSemester === "" || semesterIsApproved}
          type="submit"
        >
          {semesterIsApproved
            ? "Constancia semestral firmada"
            : isSubmitting
              ? "Generando constancia semestral..."
              : semesterCertificate
                ? "Regenerar constancia semestral"
                : "Generar constancia semestral"}
        </button>
      </form>

      <div aria-live="polite" className="mt-4 space-y-3">
        {availableSemesters.length === 0 ? (
          <FeedbackPanel
            message="Primero debe existir al menos una constancia por curso para consolidar el periodo."
            title="No hay cursos consolidados"
            tone="warning"
          />
        ) : null}
        {errorMessage ? (
          <FeedbackPanel
            message={errorMessage}
            title="No se pudo generar la constancia semestral"
            tone="error"
          />
        ) : null}
        {requiresIncompleteConfirmation ? (
          <FeedbackPanel
            message="Aun no se han generado constancias para todos los cursos del periodo. La constancia semestral solo incluira las constancias existentes. Vuelva a presionar el boton para continuar."
            title="Consolidacion parcial"
            tone="warning"
          />
        ) : null}
        {successMessage ? (
          <FeedbackPanel
            message={successMessage}
            title="Generacion exitosa"
            tone="success"
          />
        ) : null}
      </div>
    </section>
  );
}

function buildAvailableSemesters(
  certificates: CertificateGenerationSummary[],
): { semester: string; count: number; semesterCertificate: CertificateGenerationSummary | null }[] {
  const bySemester = new Map<string, Set<string>>();
  const generatedSemesters = new Map<string, CertificateGenerationSummary>();

  certificates
    .filter((certificate) =>
      (certificate.certificateType === "COURSE" || certificate.type === "CURSO") &&
      isUsableCertificateStatus(certificate.status),
    )
    .forEach((certificate) => {
      const workloadIds = bySemester.get(certificate.semester) ?? new Set<string>();
      workloadIds.add(certificate.certificateKey);
      bySemester.set(certificate.semester, workloadIds);
    });

  certificates
    .filter((certificate) =>
      (certificate.certificateType === "SEMESTER" || certificate.type === "SEMESTRAL") &&
      isUsableCertificateStatus(certificate.status),
    )
    .forEach((certificate) => {
      const current = generatedSemesters.get(certificate.semester);
      if (!current || Number(certificate.generationId) > Number(current.generationId)) {
        generatedSemesters.set(certificate.semester, certificate);
      }
    });

  return Array.from(bySemester.entries())
    .map(([semester, workloadIds]) => ({
      semester,
      count: workloadIds.size,
      semesterCertificate: generatedSemesters.get(semester) ?? null,
    }))
    .sort((left, right) => right.semester.localeCompare(left.semester));
}

function FeedbackPanel({
  message,
  title,
  tone,
}: {
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
    </div>
  );
}
