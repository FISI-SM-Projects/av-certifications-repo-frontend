import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CertificateDownloadButton } from "@/components/constancia/CertificateDownloadButton";
import { descargarPdfConstancia } from "@/services/constancia/constanciaService";

vi.mock("@/services/constancia/constanciaService", () => ({
  descargarPdfConstancia: vi.fn(),
}));

const mockedDownload = vi.mocked(descargarPdfConstancia);

describe("CertificateDownloadButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: vi.fn(() => "blob:certificate-download"),
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: vi.fn(),
    });
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
  });

  it("expone un estado disabled visible mientras descarga", async () => {
    let resolveDownload!: (blob: Blob) => void;
    mockedDownload.mockReturnValue(
      new Promise((resolve) => {
        resolveDownload = resolve;
      }),
    );

    render(
      <CertificateDownloadButton
        className="bg-[var(--gold)] hover:bg-[var(--gold-soft)]"
        generationId="GEN-01"
        scope="administrative"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Descargar PDF" }));

    const downloadingButton = await screen.findByRole("button", { name: "Descargando..." });
    expect(downloadingButton).toBeDisabled();
    expect(downloadingButton).toHaveClass(
      "control-focus",
      "disabled:cursor-not-allowed",
      "disabled:opacity-60",
      "disabled:hover:bg-[var(--gold)]",
    );
    expect(mockedDownload).toHaveBeenCalledWith("GEN-01", "administrative");

    resolveDownload(new Blob(["pdf"], { type: "application/pdf" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Descargar PDF" })).toBeEnabled();
    });
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:certificate-download");
  });
});
