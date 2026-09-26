import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SemesterCertificateForm } from "@/components/constancia/SemesterCertificateForm";
import { generarConstanciaSemestral } from "@/services/constancia/constanciaService";
import { getAllAuthenticatedTeacherCourses } from "@/services/docente/academicWorkloadService";
import type { CertificateGenerationSummary } from "@/types/constancia/constancia.types";
import type { AcademicWorkload } from "@/types/docente/academicWorkload.types";

vi.mock("@/services/constancia/constanciaService", () => ({
  generarConstanciaSemestral: vi.fn(),
}));

vi.mock("@/services/docente/academicWorkloadService", () => ({
  getAllAuthenticatedTeacherCourses: vi.fn(),
}));

const mockedGenerate = vi.mocked(generarConstanciaSemestral);
const mockedGetAllWorkloads = vi.mocked(getAllAuthenticatedTeacherCourses);

describe("SemesterCertificateForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedGetAllWorkloads.mockResolvedValue([
      workload(11, "COURSE11", 1, 31, "26.1"),
      workload(12, "COURSE12", 2, 31, "26.1"),
    ]);
    mockedGenerate.mockResolvedValue({
      generationId: "semester-generation-1",
      certificateKey: "semester-certificate-1",
      version: 1,
      type: "SEMESTRAL",
      status: "GENERADO",
      teacherCode: "DEV001",
      teacherFullName: "Docente de prueba",
      semester: "26.1",
      courseCount: 2,
      sourceGenerationIds: ["course-generation-1", "course-generation-2"],
      generatedAt: "2026-09-24T00:00:00Z",
      viewUrl: "/view",
      downloadUrl: "/download",
    });
  });

  it("carga la información académica con la generación deshabilitada", () => {
    mockedGetAllWorkloads.mockReturnValue(new Promise(() => undefined));

    renderForm();

    expect(screen.getByText("Cargando información académica...")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Cargando información académica...");
    expect(screen.getByRole("combobox", { name: "Período académico" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Generar constancia semestral" })).toBeDisabled();
  });

  it("selecciona el único período y deriva sus cursos de la carga académica", async () => {
    renderForm({ certificates: [certificate("COURSE11", "1", "26.1")] });

    const select = await screen.findByRole("combobox", { name: "Período académico" });
    await waitFor(() => expect(select).toHaveValue("31"));

    expect(screen.getByText("COURSE11")).toBeInTheDocument();
    expect(screen.getByText("COURSE12")).toBeInTheDocument();
    expect(screen.getByText("1 de 2 constancias disponibles")).toBeInTheDocument();
    expect(screen.getByText("Falta 1 constancia por curso para generar la constancia semestral.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Generar constancia semestral" })).toBeDisabled();
  });

  it("permite elegir entre períodos y actualiza los cursos mostrados", async () => {
    mockedGetAllWorkloads.mockResolvedValue([
      workload(11, "COURSE11", 1, 31, "26.1"),
      workload(22, "COURSE22", 2, 32, "26.2"),
    ]);

    renderForm();

    const select = await screen.findByRole("combobox", { name: "Período académico" });
    await waitFor(() => expect(select).toBeEnabled());
    expect(select).toHaveValue("");
    expect(within(select).getByRole("option", { name: "26.1" })).toBeInTheDocument();
    expect(within(select).getByRole("option", { name: "26.2" })).toBeInTheDocument();

    fireEvent.change(select, { target: { value: "32" } });

    expect(screen.getByText("COURSE22")).toBeInTheDocument();
    expect(screen.queryByText("COURSE11")).not.toBeInTheDocument();
  });

  it("no mezcla períodos y cuenta una sola cobertura aunque existan varias versiones", async () => {
    renderForm({
      certificates: [
        certificate("COURSE11", "1", "25.2", 1),
        certificate("COURSE12", "2", "26.1", 1),
        certificate("COURSE12", "2", "26.1", 2),
        certificate(null, null, "26.1", 1, "SEMESTRAL"),
      ],
    });

    expect(await screen.findByText("1 de 2 constancias disponibles")).toBeInTheDocument();
    expect(screen.getAllByText("Disponible")).toHaveLength(1);
    expect(screen.getAllByText("Faltante")).toHaveLength(1);
    expect(screen.getByText("Disponible")).not.toHaveAttribute("role");
    expect(screen.getByText("Faltante")).not.toHaveAttribute("role");
    expect(screen.getAllByRole("status")).toHaveLength(1);
  });

  it("genera el request desde las asignaciones sin identidad manual", async () => {
    const onGenerated = vi.fn();
    renderForm({
      certificates: [
        certificate("COURSE11", "1", "26.1"),
        certificate("COURSE12", "2", "26.1"),
      ],
      onGenerated,
    });

    const generateButton = screen.getByRole("button", { name: "Generar constancia semestral" });
    await waitFor(() => expect(generateButton).toBeEnabled());
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(mockedGenerate).toHaveBeenCalledWith({
        semester: "26.1",
        expected_courses: [
          { code: "COURSE11", section: "1" },
          { code: "COURSE12", section: "2" },
        ],
      });
    });
    expect(JSON.stringify(mockedGenerate.mock.calls[0][0])).not.toMatch(
      /teacherCode|teacherId|personId/,
    );
    expect(onGenerated).toHaveBeenCalledTimes(1);
    expect(screen.getAllByRole("status")).toHaveLength(2);
    expect(screen.getByText("Constancia semestral generada correctamente.").closest("[role='status']"))
      .toBeInTheDocument();
  });

  it("conserva secciones distintas del mismo curso en el request", async () => {
    mockedGetAllWorkloads.mockResolvedValue([
      workload(11, "COURSE11", 1, 31, "26.1"),
      workload(12, "COURSE11", 2, 31, "26.1"),
    ]);
    renderForm({
      certificates: [
        certificate("COURSE11", "1", "26.1"),
        certificate("COURSE11", "2", "26.1"),
      ],
    });

    const generateButton = screen.getByRole("button", { name: "Generar constancia semestral" });
    await waitFor(() => expect(generateButton).toBeEnabled());
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(mockedGenerate).toHaveBeenCalledWith({
        semester: "26.1",
        expected_courses: [
          { code: "COURSE11", section: "1" },
          { code: "COURSE11", section: "2" },
        ],
      });
    });
  });

  it("muestra el error de carga académica y permite reintentar", async () => {
    mockedGetAllWorkloads
      .mockRejectedValueOnce(new Error("unavailable"))
      .mockResolvedValueOnce([workload(11, "COURSE11", 1, 31, "26.1")]);

    renderForm();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No se pudo cargar tu carga académica.",
    );
    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));

    await waitFor(() => {
      expect(screen.getByRole("combobox", { name: "Período académico" })).toHaveValue("31");
    });
    expect(mockedGetAllWorkloads).toHaveBeenCalledTimes(2);
  });

  it("explica el estado sin carga y mantiene la generación deshabilitada", async () => {
    mockedGetAllWorkloads.mockResolvedValue([]);

    renderForm();

    expect(
      await screen.findByText("No tienes cursos asignados para generar una constancia semestral."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Generar constancia semestral" })).toBeDisabled();
  });

  it("bloquea la generación cuando el listado de constancias no está disponible", async () => {
    const onRetryCertificates = vi.fn();
    renderForm({
      certificatesError: "request failed",
      onRetryCertificates,
    });

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No se pudieron cargar tus constancias.",
    );
    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));

    expect(onRetryCertificates).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Generar constancia semestral" })).toBeDisabled();
  });

  it("anuncia un error de generación sin convertir los estados por curso en alerts", async () => {
    mockedGenerate.mockRejectedValue(new Error("unavailable"));
    renderForm({
      certificates: [
        certificate("COURSE11", "1", "26.1"),
        certificate("COURSE12", "2", "26.1"),
      ],
    });

    const generateButton = screen.getByRole("button", { name: "Generar constancia semestral" });
    await waitFor(() => expect(generateButton).toBeEnabled());
    fireEvent.click(generateButton);

    const alerts = await screen.findAllByRole("alert");
    expect(alerts).toHaveLength(1);
    expect(alerts[0]).toHaveTextContent(
      "No se pudo generar la constancia semestral. Inténtalo nuevamente.",
    );
    expect(screen.getAllByText("Disponible")).toHaveLength(2);
  });
});

function renderForm({
  certificates = [],
  certificatesError = null,
  certificatesLoading = false,
  onGenerated = vi.fn(),
  onRetryCertificates = vi.fn(),
}: {
  certificates?: CertificateGenerationSummary[];
  certificatesError?: string | null;
  certificatesLoading?: boolean;
  onGenerated?: () => Promise<void> | void;
  onRetryCertificates?: () => Promise<void> | void;
} = {}) {
  return render(
    <SemesterCertificateForm
      certificates={certificates}
      certificatesError={certificatesError}
      certificatesLoading={certificatesLoading}
      onGenerated={onGenerated}
      onRetryCertificates={onRetryCertificates}
    />,
  );
}

function workload(
  id: number,
  courseCode: string,
  section: number,
  periodId: number,
  semesterCode: string,
): AcademicWorkload {
  return {
    id,
    moodleId: 1000 + id,
    teacherId: 20,
    cycle: 8,
    section,
    plan: 2018,
    school: "SW",
    course: {
      id: 2000 + id,
      code: courseCode,
      name: `Curso ${courseCode}`,
    },
    academicPeriod: {
      id: periodId,
      semesterCode,
      startDate: "2026-04-01",
      endDate: "2026-08-01",
    },
  };
}

function certificate(
  courseCode: string | null,
  section: string | null,
  semester: string,
  version = 1,
  type: "CURSO" | "SEMESTRAL" = "CURSO",
): CertificateGenerationSummary {
  return {
    generationId: `${type}-${courseCode ?? "semester"}-${version}`,
    certificateKey: `${type}-${courseCode ?? "semester"}`,
    version,
    type,
    status: "GENERADO",
    teacherCode: "DEV001",
    courseCode,
    section,
    semester,
    generatedAt: "2026-09-24T00:00:00Z",
    viewUrl: "/view",
    downloadUrl: "/download",
  };
}
