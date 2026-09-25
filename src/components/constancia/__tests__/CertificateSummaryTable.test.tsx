import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CertificateSummaryTable } from "@/components/constancia/CertificateSummaryTable";
import type { CertificateGenerationSummary } from "@/types/constancia/constancia.types";

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

describe("CertificateSummaryTable", () => {
  it("muestra los datos prioritarios y secundarios de una constancia por curso", () => {
    render(<CertificateSummaryTable certificates={[courseCertificate()]} />);

    const card = mobileCards()[0];
    expect(within(card).getByText("Constancia por curso")).toBeInTheDocument();
    expect(within(card).getByRole("heading", { name: "COURSE01" })).toBeInTheDocument();
    expect(within(card).getByText("Período 26.1 · Sección 2")).toBeInTheDocument();
    expect(within(card).getByText("Generado")).toBeInTheDocument();
    expect(within(card).getByText("v002")).toBeInTheDocument();
    expect(within(card).getByText("24/09/2026, 10:00 a. m.")).toBeInTheDocument();
    expect(within(card).getByRole("button", { name: "Descargar PDF" })).toHaveAttribute(
      "data-scope",
      "self",
    );
  });

  it("muestra una constancia semestral sin valores nulos o indefinidos", () => {
    render(<CertificateSummaryTable certificates={[semesterCertificate()]} />);

    const card = mobileCards()[0];
    expect(within(card).getByText("Constancia semestral")).toBeInTheDocument();
    expect(within(card).getByRole("heading", { name: "Período 26.1" })).toBeInTheDocument();
    expect(within(card).getByText("Aprobado")).toBeInTheDocument();
    expect(card).not.toHaveTextContent("undefined");
    expect(card).not.toHaveTextContent("null");
    expect(card).not.toHaveTextContent("Sección");
  });

  it("conserva generationId, detailReturnTo y scope administrativo en las acciones", () => {
    render(
      <CertificateSummaryTable
        accessScope="administrative"
        certificates={[courseCertificate({ generationId: "GEN/01" })]}
        detailReturnTo="/director/docentes/DOC001"
      />,
    );

    const card = mobileCards()[0];
    expect(within(card).getByRole("link", { name: "Ver detalle" })).toHaveAttribute(
      "href",
      "/constancias/GEN%2F01?returnTo=%2Fdirector%2Fdocentes%2FDOC001",
    );
    expect(within(card).getByRole("button", { name: "Descargar PDF" })).toHaveAttribute(
      "data-generation-id",
      "GEN/01",
    );
    expect(within(card).getByRole("button", { name: "Descargar PDF" })).toHaveAttribute(
      "data-scope",
      "administrative",
    );
  });

  it("muestra el código docente únicamente cuando se solicita", () => {
    const { rerender } = render(
      <CertificateSummaryTable certificates={[courseCertificate()]} showTeacherCode />,
    );

    expect(within(mobileCards()[0]).getByText("Código docente")).toBeInTheDocument();
    expect(within(mobileCards()[0]).getByText("DOC001")).toBeInTheDocument();

    rerender(<CertificateSummaryTable certificates={[courseCertificate()]} />);

    expect(within(mobileCards()[0]).queryByText("Código docente")).not.toBeInTheDocument();
    expect(within(mobileCards()[0]).queryByText("DOC001")).not.toBeInTheDocument();
  });

  it("respeta el mensaje vacío proporcionado por el consumidor", () => {
    render(<CertificateSummaryTable certificates={[]} emptyMessage="Sin resultados administrativos." />);

    expect(screen.getByText("Sin resultados administrativos.")).toBeInTheDocument();
    expect(screen.queryByTestId("mobile-certificate-list")).not.toBeInTheDocument();
    expect(screen.queryByTestId("desktop-certificate-table")).not.toBeInTheDocument();
  });

  it("mantiene separados los datos de varias constancias", () => {
    render(
      <CertificateSummaryTable
        certificates={[
          courseCertificate({ courseCode: "COURSE01", generationId: "GEN-01", section: "1" }),
          courseCertificate({ courseCode: "COURSE02", generationId: "GEN-02", section: "3" }),
        ]}
      />,
    );

    const cards = mobileCards();
    expect(cards).toHaveLength(2);
    expect(within(cards[0]).getByRole("heading", { name: "COURSE01" })).toBeInTheDocument();
    expect(within(cards[0]).queryByText("COURSE02")).not.toBeInTheDocument();
    expect(within(cards[1]).getByRole("heading", { name: "COURSE02" })).toBeInTheDocument();
    expect(within(cards[1]).queryByText("COURSE01")).not.toBeInTheDocument();
  });
});

function mobileCards(): HTMLElement[] {
  return within(screen.getByTestId("mobile-certificate-list")).getAllByRole("article");
}

function courseCertificate(
  overrides: Partial<CertificateGenerationSummary> = {},
): CertificateGenerationSummary {
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

function semesterCertificate(): CertificateGenerationSummary {
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
