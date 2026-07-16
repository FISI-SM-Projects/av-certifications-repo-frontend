import { ApiError, httpJson, isRecord } from "@/lib/api/httpClient";
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

  try {
    return await httpJson<PerfilDocenteResponse>(
      `/api/v1/docentes/${encodeURIComponent(codigoDocente)}/perfil`,
      {
        networkErrorMessage: ERROR_CONEXION,
        defaultErrorMessage: "No se pudo obtener el perfil docente.",
        validate: validatePerfilDocenteResponse,
      },
    );
  } catch (error) {
    if (error instanceof ApiError) {
      throw new PerfilDocenteApiError(
        error.message || (error.status === 404
          ? "No se encontro el perfil docente."
          : "No se pudo obtener el perfil docente."),
        error.status,
      );
    }

    throw error;
  }
}

function validatePerfilDocenteResponse(payload: unknown): PerfilDocenteResponse {
  if (!isRecord(payload) || !isDocente(payload.docente) || !Array.isArray(payload.constancias)) {
    throw new ApiError("La respuesta del perfil docente no es valida.", 0);
  }

  if (!payload.constancias.every(isConstanciaPerfil)) {
    throw new ApiError("La lista de constancias del perfil no es valida.", 0);
  }

  return payload as PerfilDocenteResponse;
}

function isDocente(value: unknown): boolean {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "number" &&
    typeof value.codigo === "string" &&
    typeof value.nombres === "string" &&
    typeof value.apellidos === "string" &&
    typeof value.correoInstitucional === "string" &&
    typeof value.departamentoAcademico === "string" &&
    typeof value.categoria === "string" &&
    typeof value.condicion === "string"
  );
}

function isConstanciaPerfil(value: unknown): boolean {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.generationId === "string" &&
    typeof value.certificateKey === "string" &&
    typeof value.version === "number" &&
    (value.type === "CURSO" || value.type === "SEMESTRAL") &&
    (value.status === "GENERADO" || value.status === "APROBADO") &&
    typeof value.teacherCode === "string" &&
    (typeof value.courseCode === "string" || value.courseCode === null) &&
    (typeof value.section === "string" || value.section === null) &&
    typeof value.semester === "string" &&
    typeof value.generatedAt === "string" &&
    typeof value.viewUrl === "string" &&
    typeof value.downloadUrl === "string"
  );
}
