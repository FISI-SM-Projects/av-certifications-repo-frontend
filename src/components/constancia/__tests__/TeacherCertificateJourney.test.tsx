import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  downloadPdf: vi.fn(),
  generateCourse: vi.fn(),
  generateSemester: vi.fn(),
  getAllWorkloads: vi.fn(),
  getCertificate: vi.fn(),
  getPdf: vi.fn(),
  listCertificates: vi.fn(),
}));

vi.mock("@/context/auth/AuthProvider", () => ({
  useAuth: () => ({ roles: ["DOCENTE"] }),
}));

vi.mock("@/services/docente/academicWorkloadService", () => ({
  getAllAuthenticatedTeacherCourses: mocks.getAllWorkloads,
}));

vi.mock("@/services/constancia/constanciaService", () => ({
  descargarPdfConstancia: mocks.downloadPdf,
  generarConstanciaCurso: mocks.generateCourse,
  generarConstanciaSemestral: mocks.generateSemester,
  listarConstanciasDocente: mocks.listCertificates,
  obtenerConstanciaPorGeneracion: mocks.getCertificate,
  obtenerPdfConstancia: mocks.getPdf,
}));

import { CertificateDetailView } from "@/components/constancia/CertificateDetailView";
import { TeacherCertificatesView } from "@/components/constancia/TeacherCertificatesView";
import type { CertificateGenerationSummary } from "@/types/constancia/constancia.types";
import type { AcademicWorkload } from "@/types/docente/academicWorkload.types";

describe("journey crítico de constancias DOCENTE", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: vi.fn(() => "blob:teacher-certificate"),
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: vi.fn(),
    });
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);

    mocks.getAllWorkloads.mockResolvedValue(workloads());
    mocks.generateCourse.mockResolvedValue(courseGenerationResponse());
    mocks.generateSemester.mockResolvedValue(semesterGenerationResponse());
    mocks.downloadPdf.mockResolvedValue(new Blob(["pdf"], { type: "application/pdf" }));
    mocks.getCertificate.mockResolvedValue(courseCertificate("COURSE12", "2", "GEN-12"));
    mocks.getPdf.mockResolvedValue(new Blob(["preview"], { type: "application/pdf" }));
  });

  it("genera desde una asignación, refresca el listado y conserva detalle/descarga self", async () => {
    const initialCertificates = [courseCertificate("COURSE11", "1", "GEN-11")];
    const generatedCertificates = [
      ...initialCertificates,
      courseCertificate("COURSE12", "2", "GEN-12"),
    ];
    mocks.listCertificates
      .mockResolvedValueOnce(initialCertificates)
      .mockResolvedValue(generatedCertificates);

    const listTree = render(<TeacherCertificatesView />);

    expect(await screen.findAllByText("COURSE11")).not.toHaveLength(0);
    fireEvent.click(screen.getByRole("button", { name: "Generar por curso" }));

    const courseSelect = await screen.findByRole("combobox", { name: "Curso" });
    await waitFor(() => expect(courseSelect).toBeEnabled());
    fireEvent.change(courseSelect, { target: { value: "12" } });
    fireEvent.click(screen.getByRole("button", { name: "Generar constancia por curso" }));

    await waitFor(() => {
      expect(mocks.generateCourse).toHaveBeenCalledWith({
        course: {
          code: "COURSE12",
          subject: "Calidad de Software",
          cycle: "8",
          section: "2",
          school: "SW",
          plan: "2018",
          semester: "26.1",
        },
        source_system: "moodle",
      });
    });
    expect(JSON.stringify(mocks.generateCourse.mock.calls[0][0])).not.toMatch(
      /teacherCode|teacherId|personId/,
    );
    expect(await screen.findByText("Constancia generada correctamente.")).toBeInTheDocument();

    const generatedCard = findMobileCertificateCard("COURSE12");
    expect(within(generatedCard).getByRole("link", { name: "Ver detalle" })).toHaveAttribute(
      "href",
      "/constancias/GEN-12",
    );
    fireEvent.click(within(generatedCard).getByRole("button", { name: "Descargar PDF" }));
    await waitFor(() => expect(mocks.downloadPdf).toHaveBeenCalledWith("GEN-12", "self"));

    listTree.unmount();
    render(<CertificateDetailView generationId="GEN-12" returnTo="/constancias" />);

    expect(await screen.findByRole("heading", { name: "Constancia por curso" })).toBeInTheDocument();
    expect(mocks.getCertificate).toHaveBeenCalledWith("GEN-12", "self");
    await waitFor(() => expect(mocks.getPdf).toHaveBeenCalledWith("GEN-12", "self"));
    expect(screen.getByTitle("Vista previa de GEN-12")).toHaveAttribute(
      "src",
      "blob:teacher-certificate",
    );
    expect(screen.getByRole("link", { name: "Volver a mis constancias" })).toHaveAttribute(
      "href",
      "/constancias",
    );
  });

  it("habilita la semestral solo cuando el listado actualizado cubre todas las asignaciones", async () => {
    const oneCovered = [courseCertificate("COURSE11", "1", "GEN-11")];
    const fullyCovered = [
      courseCertificate("COURSE11", "1", "GEN-11-V1", 1),
      courseCertificate("COURSE11", "1", "GEN-11-V2", 2),
      courseCertificate("COURSE12", "2", "GEN-12"),
    ];
    mocks.listCertificates
      .mockResolvedValueOnce(oneCovered)
      .mockResolvedValue(fullyCovered);

    render(<TeacherCertificatesView />);

    expect(await screen.findByText("1 de 2 constancias disponibles")).toBeInTheDocument();
    const semesterButton = screen.getByRole("button", { name: "Generar constancia semestral" });
    expect(semesterButton).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Actualizar" }));

    expect(await screen.findByText("2 de 2 constancias disponibles")).toBeInTheDocument();
    await waitFor(() => expect(semesterButton).toBeEnabled());
    fireEvent.click(semesterButton);

    await waitFor(() => {
      expect(mocks.generateSemester).toHaveBeenCalledWith({
        semester: "26.1",
        expected_courses: [
          { code: "COURSE11", section: "1" },
          { code: "COURSE12", section: "2" },
        ],
      });
    });
    expect(JSON.stringify(mocks.generateSemester.mock.calls[0][0])).not.toMatch(
      /teacherCode|teacherId|personId/,
    );
    expect(screen.getByText("Constancia semestral generada correctamente.")).toBeInTheDocument();
  });
});

function findMobileCertificateCard(courseCode: string): HTMLElement {
  const cards = within(screen.getByTestId("mobile-certificate-list")).getAllByRole("article");
  const card = cards.find((candidate) => candidate.textContent?.includes(courseCode));
  if (card === undefined) {
    throw new Error(`No se encontró la constancia ${courseCode}.`);
  }
  return card;
}

function workloads(): AcademicWorkload[] {
  return [
    workload(11, "COURSE11", "Arquitectura de Software", 1),
    workload(12, "COURSE12", "Calidad de Software", 2),
  ];
}

function workload(
  id: number,
  code: string,
  name: string,
  section: number,
): AcademicWorkload {
  return {
    id,
    moodleId: 1000 + id,
    teacherId: 20,
    cycle: 8,
    section,
    plan: 2018,
    school: "SW",
    course: { id: 2000 + id, code, name },
    academicPeriod: {
      id: 31,
      semesterCode: "26.1",
      startDate: "2026-04-01",
      endDate: "2026-08-01",
    },
  };
}

function courseCertificate(
  courseCode: string,
  section: string,
  generationId: string,
  version = 1,
): CertificateGenerationSummary {
  return {
    generationId,
    certificateKey: `CERT-${courseCode}`,
    version,
    type: "CURSO",
    status: "GENERADO",
    teacherCode: "DOC-001",
    courseCode,
    section,
    semester: "26.1",
    generatedAt: "2026-09-24T15:00:00Z",
    viewUrl: "/view",
    downloadUrl: "/download",
  };
}

function courseGenerationResponse() {
  return {
    ...courseCertificate("COURSE12", "2", "GEN-12"),
    teacherFullName: "Docente Prueba",
    courseSubject: "Calidad de Software",
  };
}

function semesterGenerationResponse() {
  return {
    generationId: "SEM-26.1",
    certificateKey: "CERT-SEM-26.1",
    version: 1,
    type: "SEMESTRAL" as const,
    status: "GENERADO" as const,
    teacherCode: "DOC-001",
    teacherFullName: "Docente Prueba",
    semester: "26.1",
    courseCount: 2,
    sourceGenerationIds: ["GEN-11-V2", "GEN-12"],
    generatedAt: "2026-09-24T16:00:00Z",
    viewUrl: "/view",
    downloadUrl: "/download",
  };
}
