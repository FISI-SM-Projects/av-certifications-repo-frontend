"use client";

import { useState } from "react";

import {
  descargarPdfConstancia,
  type CertificateAccessScope,
} from "@/services/constancia/constanciaService";

type CertificateDownloadButtonProps = {
  generationId: string;
  scope?: CertificateAccessScope;
  className: string;
  label?: string;
};

export function CertificateDownloadButton({
  generationId,
  scope = "self",
  className,
  label = "Descargar PDF",
}: CertificateDownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleDownload() {
    if (isDownloading) {
      return;
    }

    setIsDownloading(true);
    setErrorMessage(null);

    try {
      const blob = await descargarPdfConstancia(generationId, scope);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${generationId}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch {
      setErrorMessage("No se pudo descargar el PDF.");
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button
        className={`${className} control-focus disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-[var(--gold)]`}
        disabled={isDownloading}
        onClick={handleDownload}
        type="button"
      >
        {isDownloading ? "Descargando..." : label}
      </button>
      {errorMessage ? (
        <span className="text-xs text-[#f0b8b8]" role="alert">
          {errorMessage}
        </span>
      ) : null}
    </span>
  );
}
