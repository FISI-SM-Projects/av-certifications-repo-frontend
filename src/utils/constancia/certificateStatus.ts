import type { EstadoConstancia } from "@/types/constancia/constancia.types";

const GENERATED_STATUSES = new Set<EstadoConstancia>(["GENERADA", "GENERADO", "EMITIDO"]);
const SIGNED_STATUSES = new Set<EstadoConstancia>(["FIRMADA", "APROBADO", "VERIFICADO"]);

export function isGeneratedStatus(status: EstadoConstancia): boolean {
  return GENERATED_STATUSES.has(status);
}

export function isSignedStatus(status: EstadoConstancia): boolean {
  return SIGNED_STATUSES.has(status);
}

export function isUsableCertificateStatus(status: EstadoConstancia): boolean {
  return isGeneratedStatus(status) || isSignedStatus(status);
}

export function displayCertificateStatus(status: EstadoConstancia): string {
  if (isSignedStatus(status)) {
    return "FIRMADA";
  }

  if (isGeneratedStatus(status)) {
    return "GENERADA";
  }

  return status.replaceAll("_", " ");
}
