import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { TeacherCertificatesView } from "@/components/constancia/TeacherCertificatesView";
import { listarConstanciasDocente } from "@/services/constancia/constanciaService";
import type { CertificateGenerationSummary } from "@/types/constancia/constancia.types";

vi.mock("@/services/constancia/constanciaService", () => ({
  listarConstanciasDocente: vi.fn(),
}));

vi.mock("@/components/constancia/CourseCertificateForm", () => ({
  CourseCertificateForm: () => null,
}));

vi.mock("@/components/constancia/SemesterCertificateForm", () => ({
  SemesterCertificateForm: () => null,
}));

vi.mock("@/components/constancia/CertificateSummaryTable", () => ({
  CertificateSummaryTable: () => null,
}));

const mockedListCertificates = vi.mocked(listarConstanciasDocente);

describe("TeacherCertificatesView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("expone la carga como status y el estado vacío como información normal", async () => {
    let resolveRequest!: (value: CertificateGenerationSummary[]) => void;
    mockedListCertificates.mockReturnValue(
      new Promise<CertificateGenerationSummary[]>((resolve) => {
        resolveRequest = resolve;
      }),
    );

    render(<TeacherCertificatesView />);

    expect(screen.getByRole("status")).toHaveTextContent("Cargando constancias...");

    await act(async () => {
      resolveRequest([]);
    });

    expect(await screen.findByText("Aún no tienes constancias generadas.")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("expone el error del listado como un único alert", async () => {
    mockedListCertificates.mockRejectedValue(new Error("unavailable"));

    render(<TeacherCertificatesView />);

    const alerts = await screen.findAllByRole("alert");
    expect(alerts).toHaveLength(1);
    expect(alerts[0]).toHaveTextContent(
      "No se pudieron cargar las constancias. Inténtalo nuevamente.",
    );
    expect(alerts[0]).not.toHaveAttribute("aria-live");
  });
});
