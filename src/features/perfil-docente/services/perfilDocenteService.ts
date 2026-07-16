import { API_BASE_URL } from "@/lib/api";
import type { PerfilDocenteResponse } from "../types/perfilDocente.types";

const ERROR_CONEXION = "No se pudo conectar con el backend.";

export class PerfilDocenteApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "PerfilDocenteApiError";
    this.status = status;
  }
}

export async function obtenerPerfilDocentePorCodigo(
  teacherCode: string,
): Promise<PerfilDocenteResponse> {
  const codigoDocente = teacherCode.trim();

  if (codigoDocente === "") {
    throw new PerfilDocenteApiError("El codigo docente es obligatorio.", 0);
  }

  const response = await safeFetch(
    `${API_BASE_URL}/api/v1/docentes/${encodeURIComponent(codigoDocente)}/perfil`,
  );

  if (!response.ok) {
    const message = await readErrorMessage(response);
    throw new PerfilDocenteApiError(
      message ?? (response.status === 404
        ? "No se encontro el perfil docente."
        : "No se pudo obtener el perfil docente."),
      response.status,
    );
  }

  try {
    return (await response.json()) as PerfilDocenteResponse;
  } catch {
    throw new PerfilDocenteApiError("La respuesta del perfil docente no es valida.", response.status);
  }
}

async function safeFetch(input: RequestInfo | URL): Promise<Response> {
  try {
    return await fetch(input, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    throw new PerfilDocenteApiError(ERROR_CONEXION, 0);
  }
}

async function readErrorMessage(response: Response): Promise<string | null> {
  try {
    const data = (await response.json()) as { message?: unknown };

    if (typeof data.message === "string" && data.message.trim() !== "") {
      return data.message;
    }
  } catch {
    return null;
  }

  return null;
}
