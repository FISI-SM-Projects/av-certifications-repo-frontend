import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CourseCertificateForm } from "@/components/constancia/CourseCertificateForm";
import { generarConstanciaCurso } from "@/services/constancia/constanciaService";
import { getAllAuthenticatedTeacherCourses } from "@/services/docente/academicWorkloadService";
import type { AcademicWorkload } from "@/types/docente/academicWorkload.types";

vi.mock("@/services/constancia/constanciaService", () => ({
  generarConstanciaCurso: vi.fn(),
}));

vi.mock("@/services/docente/academicWorkloadService", () => ({
  getAllAuthenticatedTeacherCourses: vi.fn(),
}));

const mockedGenerate = vi.mocked(generarConstanciaCurso);
const mockedGetAllWorkloads = vi.mocked(getAllAuthenticatedTeacherCourses);

describe("CourseCertificateForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedGetAllWorkloads.mockResolvedValue([
      workload(11, 1, "26.1"),
      workload(12, 2, "26.2"),
    ]);
    mockedGenerate.mockResolvedValue({
      generationId: "generation-1",
      certificateKey: "certificate-1",
      version: 1,
      type: "CURSO",
      status: "GENERADO",
      teacherFullName: "Docente de prueba",
      courseCode: "COURSE12",
      courseSubject: "Curso compartido",
      section: "2",
      semester: "26.2",
      generatedAt: "2026-09-23T00:00:00Z",
      viewUrl: "/view",
      downloadUrl: "/download",
    });
  });

  it("inicia cargando sin selección y con generación deshabilitada", () => {
    mockedGetAllWorkloads.mockReturnValue(new Promise(() => undefined));

    render(<CourseCertificateForm onCancel={vi.fn()} onGenerated={vi.fn()} />);

    expect(screen.getAllByText("Cargando cursos asignados...")).toHaveLength(2);
    expect(screen.getByRole("combobox", { name: "Curso" })).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Generar constancia por curso" }),
    ).toBeDisabled();
  });

  it("muestra asignaciones reales y deriva el request de la selección", async () => {
    const onGenerated = vi.fn();
    const { container } = render(
      <CourseCertificateForm onCancel={vi.fn()} onGenerated={onGenerated} />,
    );
    const select = await screen.findByRole("combobox", { name: "Curso" });

    await waitFor(() => expect(select).toBeEnabled());
    expect(within(select).getAllByRole("option")).toHaveLength(3);
    expect(
      within(select).getByRole("option", {
        name: "COURSE12 — Curso compartido — Sección 2 — 26.2",
      }),
    ).toBeInTheDocument();
    expect(container.querySelectorAll("input")).toHaveLength(0);

    fireEvent.change(select, { target: { value: "12" } });

    const summary = screen.getByRole("region", { name: "Datos de la asignación" });
    expect(within(summary).getByText("Curso compartido")).toBeInTheDocument();
    expect(within(summary).getByText("COURSE12")).toBeInTheDocument();
    expect(within(summary).getByText("26.2")).toBeInTheDocument();
    expect(within(summary).getByText("2")).toBeInTheDocument();
    expect(within(summary).getByText("8")).toBeInTheDocument();
    expect(within(summary).getByText("SW")).toBeInTheDocument();
    expect(within(summary).getByText("2018")).toBeInTheDocument();

    const generateButton = screen.getByRole("button", {
      name: "Generar constancia por curso",
    });
    expect(generateButton).toBeEnabled();
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(mockedGenerate).toHaveBeenCalledWith({
        course: {
          code: "COURSE12",
          subject: "Curso compartido",
          cycle: "8",
          section: "2",
          school: "SW",
          plan: "2018",
          semester: "26.2",
        },
        source_system: "moodle",
      });
    });
    expect(JSON.stringify(mockedGenerate.mock.calls[0][0])).not.toMatch(
      /teacherCode|teacherId|personId/,
    );
    expect(onGenerated).toHaveBeenCalledTimes(1);
  });

  it("muestra el error de carga y permite reintentar", async () => {
    mockedGetAllWorkloads
      .mockRejectedValueOnce(new Error("unavailable"))
      .mockResolvedValueOnce([workload(11, 1, "26.1")]);

    render(<CourseCertificateForm onCancel={vi.fn()} onGenerated={vi.fn()} />);

    expect(
      await screen.findByText("No se pudo cargar tu carga académica."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Generar constancia por curso" }),
    ).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));

    await waitFor(() => {
      expect(screen.getByRole("combobox", { name: "Curso" })).toBeEnabled();
    });
    expect(mockedGetAllWorkloads).toHaveBeenCalledTimes(2);
  });

  it("explica el estado vacío y mantiene la generación deshabilitada", async () => {
    mockedGetAllWorkloads.mockResolvedValue([]);

    render(<CourseCertificateForm onCancel={vi.fn()} onGenerated={vi.fn()} />);

    expect(
      await screen.findByText(
        "No tienes cursos asignados disponibles para generar una constancia.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Curso" })).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Generar constancia por curso" }),
    ).toBeDisabled();
  });
});

function workload(
  id: number,
  section: number,
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
      code: `COURSE${id}`,
      name: "Curso compartido",
    },
    academicPeriod: {
      id: 30 + id,
      semesterCode,
      startDate: "2026-04-01",
      endDate: "2026-08-01",
    },
  };
}
