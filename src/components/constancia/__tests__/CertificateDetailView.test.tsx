import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CertificateDetailView } from "@/components/constancia/CertificateDetailView";
import { useAuth } from "@/context/auth/AuthProvider";
import {
  obtenerConstanciaPorGeneracion,
  obtenerPdfConstancia,
} from "@/services/constancia/constanciaService";
import type { CertificateGenerationDetail } from "@/types/constancia/constancia.types";

vi.mock("@/context/auth/AuthProvider", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/services/constancia/constanciaService", () => ({
  obtenerConstanciaPorGeneracion: vi.fn(),
  obtenerPdfConstancia: vi.fn(),
}));

vi.mock("@/components/constancia/CertificateDownloadButton", () => ({
  CertificateDownloadButton: ({
    generationId,
    scope,
  }: {
    generationId: string;
    scope?: string;
  }) => (
    <button data-generation-id={generationId} data-scope={scope ?? "self"} type="button">
      Descargar PDF
    </button>
  ),
}));

vi.mock("@/utils/dates", () => ({
  formatDateTimeInLima: () => "24/09/2026, 10:00 a. m.",
}));

const mockedUseAuth = vi.mocked(useAuth);
const mockedGetCertificate = vi.mocked(obtenerConstanciaPorGeneracion);
const mockedGetPdf = vi.mocked(obtenerPdfConstancia);

describe("CertificateDetailView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: vi.fn(() => "blob:certificate-preview"),
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: vi.fn(),
    });
    mockRoles(["DOCENTE"]);
    mockedGetCertificate.mockResolvedValue(courseCertificate());
    mockedGetPdf.mockResolvedValue(new Blob(["pdf"], { type: "application/pdf" }));
  });

  it("carga el detalle con el generationId solicitado", async () => {
    let resolveCertificate!: (certificate: CertificateGenerationDetail) => void;
    mockedGetCertificate.mockReturnValue(
      new Promise((resolve) => {
        resolveCertificate = resolve;
      }),
    );

    render(<CertificateDetailView generationId=" GEN-01 " />);

    expect(await screen.findByRole("status")).toHaveTextContent("Cargando constancia...");
    expect(mockedGetCertificate).toHaveBeenCalledWith("GEN-01", "self");

    resolveCertificate(courseCertificate());
    expect(await screen.findByRole("heading", { name: "Constancia por curso" })).toBeInTheDocument();
  });

  it("prioriza los datos funcionales de una constancia por curso y oculta metadata técnica", async () => {
    render(<CertificateDetailView generationId="GEN-01" returnTo="/constancias" />);

    expect(await screen.findByRole("heading", { name: "Constancia por curso" })).toBeInTheDocument();
    expect(screen.getByText("Generado")).toBeInTheDocument();
    expect(screen.getByText("COURSE01")).toBeInTheDocument();
    expect(screen.getByText("Sección")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("Período")).toBeInTheDocument();
    expect(screen.getByText("26.1")).toBeInTheDocument();
    expect(screen.getByText("v002")).toBeInTheDocument();
    expect(screen.getByText("24/09/2026, 10:00 a. m.")).toBeInTheDocument();
    expect(screen.queryByText("Identificador de generación")).not.toBeInTheDocument();
    expect(screen.queryByText("Clave de la constancia")).not.toBeInTheDocument();
    expect(screen.queryByText("CERT-COURSE01")).not.toBeInTheDocument();
    expect(screen.queryByText("DOC001")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Volver a mis constancias" })).toHaveAttribute(
      "href",
      "/constancias",
    );

    await waitFor(() => {
      expect(mockedGetPdf).toHaveBeenCalledWith("GEN-01", "self");
    });
    expect(screen.getByTitle("Vista previa de GEN-01")).toHaveAttribute(
      "src",
      "blob:certificate-preview",
    );
    expect(screen.getByTitle("Vista previa de GEN-01")).toHaveAttribute(
      "title",
      "Vista previa de GEN-01",
    );
    expect(screen.getByRole("link", { name: "Abrir PDF en nueva pestaña" })).toHaveAttribute(
      "href",
      "blob:certificate-preview",
    );
    expect(screen.getByRole("link", { name: "Abrir PDF en nueva pestaña" })).toHaveAttribute(
      "target",
      "_blank",
    );
    expect(screen.getByRole("link", { name: "Abrir PDF en nueva pestaña" })).toHaveAttribute(
      "rel",
      "noopener noreferrer",
    );
    expect(screen.getByRole("button", { name: "Descargar PDF" })).toHaveAttribute(
      "data-generation-id",
      "GEN-01",
    );
    expect(screen.getByRole("button", { name: "Descargar PDF" })).toHaveAttribute(
      "data-scope",
      "self",
    );
  });

  it("omite curso y sección artificiales en una constancia semestral", async () => {
    mockedGetCertificate.mockResolvedValue(semesterCertificate());

    render(<CertificateDetailView generationId="SEM-01" />);

    expect(await screen.findByRole("heading", { name: "Constancia semestral" })).toBeInTheDocument();
    expect(screen.getByText("Aprobado")).toBeInTheDocument();
    expect(screen.getByText("26.1")).toBeInTheDocument();
    expect(screen.queryByText("Código de curso")).not.toBeInTheDocument();
    expect(screen.queryByText("Sección")).not.toBeInTheDocument();
    expect(screen.queryByText("Constancia semestral", { selector: "dd" })).not.toBeInTheDocument();
    expect(screen.queryByText("No aplica")).not.toBeInTheDocument();
  });

  it("usa scope administrativo, muestra el código docente y conserva returnTo", async () => {
    mockRoles(["DIRECTOR_ESCUELA"]);

    render(
      <CertificateDetailView
        generationId="GEN-01"
        returnTo="/director/docentes/DOC001"
      />,
    );

    expect(await screen.findByText("Código docente")).toBeInTheDocument();
    expect(screen.getByText("DOC001")).toBeInTheDocument();
    expect(mockedGetCertificate).toHaveBeenCalledWith("GEN-01", "administrative");
    expect(screen.getByRole("link", { name: "Volver al perfil del docente" })).toHaveAttribute(
      "href",
      "/director/docentes/DOC001",
    );

    await waitFor(() => {
      expect(mockedGetPdf).toHaveBeenCalledWith("GEN-01", "administrative");
    });
    expect(screen.getByRole("button", { name: "Descargar PDF" })).toHaveAttribute(
      "data-scope",
      "administrative",
    );
  });

  it("conserva un returnTo válido y rechaza uno externo", async () => {
    const { rerender } = render(
      <CertificateDetailView generationId="GEN-01" returnTo="/perfil-docente" />,
    );

    expect(await screen.findByRole("link", { name: "Volver al perfil docente" })).toHaveAttribute(
      "href",
      "/perfil-docente",
    );

    rerender(
      <CertificateDetailView
        generationId="GEN-01"
        returnTo="https://example.com/phishing"
      />,
    );

    expect(await screen.findByRole("link", { name: "Volver a mis constancias" })).toHaveAttribute(
      "href",
      "/constancias",
    );
  });

  it("muestra un error y permite reintentar la carga", async () => {
    mockedGetCertificate
      .mockRejectedValueOnce(new Error("unavailable"))
      .mockResolvedValueOnce(courseCertificate());

    render(<CertificateDetailView generationId="GEN-01" />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No se pudo cargar la constancia. Inténtalo nuevamente.",
    );

    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));

    expect(await screen.findByRole("heading", { name: "Constancia por curso" })).toBeInTheDocument();
    expect(mockedGetCertificate).toHaveBeenCalledTimes(2);
  });

  it("mantiene un espacio estable mientras carga la vista previa", async () => {
    mockedGetPdf.mockReturnValue(new Promise(() => undefined));

    render(<CertificateDetailView generationId="GEN-01" />);

    const loadingMessage = await screen.findByText("Cargando vista previa...");
    expect(loadingMessage).toHaveAttribute("role", "status");
    expect(loadingMessage).toHaveClass("h-[46vh]", "min-h-[320px]", "lg:min-h-[520px]");
    expect(screen.queryByTitle("Vista previa de GEN-01")).not.toBeInTheDocument();
  });

  it("conserva las acciones disponibles si falla la vista previa", async () => {
    mockedGetPdf.mockRejectedValue(new Error("pdf unavailable"));

    render(<CertificateDetailView generationId="GEN-01" />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No se pudo cargar la vista previa del PDF.",
    );
    expect(screen.getByRole("link", { name: "Volver a mis constancias" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Descargar PDF" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Abrir PDF en nueva pestaña" })).not.toBeInTheDocument();
  });

  it("revoca la URL del preview al desmontar", async () => {
    const { unmount } = render(<CertificateDetailView generationId="GEN-01" />);

    expect(await screen.findByTitle("Vista previa de GEN-01")).toBeInTheDocument();
    unmount();

    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:certificate-preview");
  });
});

function mockRoles(roles: string[]) {
  mockedUseAuth.mockReturnValue({ roles } as ReturnType<typeof useAuth>);
}

function courseCertificate(
  overrides: Partial<CertificateGenerationDetail> = {},
): CertificateGenerationDetail {
  return {
    generationId: "GEN-01",
    certificateKey: "CERT-COURSE01",
    version: 2,
    type: "CURSO",
    status: "GENERADO",
    teacherCode: "DOC001",
    courseCode: "COURSE01",
    section: "2",
    semester: "26.1",
    generatedAt: "2026-09-24T15:00:00Z",
    viewUrl: "/view",
    downloadUrl: "/download",
    ...overrides,
  };
}

function semesterCertificate(): CertificateGenerationDetail {
  return {
    ...courseCertificate(),
    generationId: "SEM-01",
    certificateKey: "CERT-SEM-01",
    type: "SEMESTRAL",
    status: "APROBADO",
    courseCode: null,
    section: null,
  };
}
