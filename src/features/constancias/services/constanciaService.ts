import { API_BASE_URL } from "@/lib/api";
import { ApiError, httpJson, isRecord, type HttpJsonOptions } from "@/lib/api/httpClient";
import type {
  CertificateGenerationDetail,
  CertificateGenerationSummary,
  CertificateHistoryItem,
  CourseCertificateRequest,
  CourseCertificateResponse,
  SemesterCertificateRequest,
  SemesterCertificateResponse,
} from "@/features/constancias/types/constancia.types";
import {
  ConstanciaApiError,
  type MissingCourse,
} from "@/features/constancias/types/constancia-error.types";

const ERROR_CONEXION = "No se pudo conectar con el backend de constancias";
const ERROR_SOLICITUD = "No se pudo completar la solicitud de constancias";

export async function generarConstanciaCurso(
  request: CourseCertificateRequest,
): Promise<CourseCertificateResponse> {
  return requestConstancia<CourseCertificateResponse>("/api/v1/constancias/curso", {
    method: "POST",
    body: request,
    validate: validateCourseCertificateResponse,
  });
}

export async function generarConstanciaSemestral(
  request: SemesterCertificateRequest,
): Promise<SemesterCertificateResponse> {
  return requestConstancia<SemesterCertificateResponse>("/api/v1/constancias/semestral", {
    method: "POST",
    body: request,
    validate: validateSemesterCertificateResponse,
  });
}

export async function listarConstanciasDocente(
  teacherCode: string,
): Promise<CertificateGenerationSummary[]> {
  const codigoDocente = requireNonBlank(teacherCode, "El codigo docente es obligatorio");

  return requestConstancia<CertificateGenerationSummary[]>(
    `/api/v1/constancias/docentes/${encodeURIComponent(codigoDocente)}`,
    {
      validate: validateCertificateGenerationList,
    },
  );
}

export async function obtenerConstanciaPorGeneracion(
  generationId: string,
): Promise<CertificateGenerationDetail> {
  const idGeneracion = requireNonBlank(
    generationId,
    "El identificador de generacion es obligatorio",
  );

  return requestConstancia<CertificateGenerationDetail>(
    `/api/v1/constancias/generaciones/${encodeURIComponent(idGeneracion)}`,
    {
      validate: validateCertificateGenerationSummary,
    },
  );
}

export async function obtenerHistorialConstancia(
  certificateKey: string,
): Promise<CertificateHistoryItem[]> {
  const claveConstancia = requireNonBlank(
    certificateKey,
    "La clave de constancia es obligatoria",
  );

  return requestConstancia<CertificateHistoryItem[]>(
    `/api/v1/constancias/certificados/${encodeURIComponent(claveConstancia)}/historial`,
    {
      validate: validateCertificateGenerationList,
    },
  );
}

export function construirUrlVisualizacionPdf(generationId: string): string {
  const idGeneracion = requireNonBlank(
    generationId,
    "El identificador de generacion es obligatorio",
  );

  return `${API_BASE_URL}/api/v1/constancias/generaciones/${encodeURIComponent(idGeneracion)}/pdf`;
}

export function construirUrlDescargaPdf(generationId: string): string {
  const idGeneracion = requireNonBlank(
    generationId,
    "El identificador de generacion es obligatorio",
  );

  return `${API_BASE_URL}/api/v1/constancias/generaciones/${encodeURIComponent(idGeneracion)}/download`;
}

async function requestConstancia<T>(
  path: string,
  options: HttpJsonOptions<T>,
): Promise<T> {
  try {
    return await httpJson<T>(path, {
      ...options,
      networkErrorMessage: ERROR_CONEXION,
      defaultErrorMessage: ERROR_SOLICITUD,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw toConstanciaApiError(error);
    }

    throw error;
  }
}

function toConstanciaApiError(error: ApiError): ConstanciaApiError {
  const payload = isRecord(error.payload) ? error.payload : null;
  const missingFields = Array.isArray(payload?.missingFields)
    ? payload.missingFields.filter((field): field is string => typeof field === "string")
    : undefined;
  const missingCourses = Array.isArray(payload?.missingCourses)
    ? payload.missingCourses.filter(isMissingCourse)
    : undefined;

  return new ConstanciaApiError(
    error.message || ERROR_SOLICITUD,
    error.status,
    missingFields,
    missingCourses,
  );
}

function validateCourseCertificateResponse(payload: unknown): CourseCertificateResponse {
  if (!isRecord(payload) || !hasCommonCertificateFields(payload)) {
    throw new ApiError("La respuesta de generacion por curso no es valida.", 0);
  }

  if (
    typeof payload.teacherFullName !== "string" ||
    typeof payload.courseCode !== "string" ||
    typeof payload.courseSubject !== "string" ||
    typeof payload.section !== "string"
  ) {
    throw new ApiError("La respuesta de generacion por curso no es valida.", 0);
  }

  return payload as CourseCertificateResponse;
}

function validateSemesterCertificateResponse(payload: unknown): SemesterCertificateResponse {
  if (!isRecord(payload) || !hasCommonCertificateFields(payload) || payload.type !== "SEMESTRAL") {
    throw new ApiError("La respuesta de generacion semestral no es valida.", 0);
  }

  if (
    typeof payload.teacherCode !== "string" ||
    typeof payload.teacherFullName !== "string" ||
    typeof payload.courseCount !== "number" ||
    !Array.isArray(payload.sourceGenerationIds) ||
    !payload.sourceGenerationIds.every((id) => typeof id === "string")
  ) {
    throw new ApiError("La respuesta de generacion semestral no es valida.", 0);
  }

  return payload as SemesterCertificateResponse;
}

function validateCertificateGenerationList(payload: unknown): CertificateGenerationSummary[] {
  if (!Array.isArray(payload) || !payload.every(validateCertificateGenerationSummaryShape)) {
    throw new ApiError("La lista de constancias no tiene el formato esperado.", 0);
  }

  return payload as CertificateGenerationSummary[];
}

function validateCertificateGenerationSummary(payload: unknown): CertificateGenerationSummary {
  if (!validateCertificateGenerationSummaryShape(payload)) {
    throw new ApiError("La constancia no tiene el formato esperado.", 0);
  }

  return payload as CertificateGenerationSummary;
}

function validateCertificateGenerationSummaryShape(value: unknown): boolean {
  if (!isRecord(value) || !hasCommonCertificateFields(value)) {
    return false;
  }

  return (
    typeof value.teacherCode === "string" &&
    (typeof value.courseCode === "string" || value.courseCode === null) &&
    (typeof value.section === "string" || value.section === null)
  );
}

function hasCommonCertificateFields(value: Record<string, unknown>): boolean {
  return (
    typeof value.generationId === "string" &&
    typeof value.certificateKey === "string" &&
    typeof value.version === "number" &&
    (value.type === "CURSO" || value.type === "SEMESTRAL") &&
    (value.status === "GENERADO" || value.status === "APROBADO") &&
    typeof value.semester === "string" &&
    typeof value.generatedAt === "string" &&
    typeof value.viewUrl === "string" &&
    typeof value.downloadUrl === "string"
  );
}

function isMissingCourse(value: unknown): value is MissingCourse {
  if (!isRecord(value)) {
    return false;
  }

  return typeof value.code === "string" && typeof value.section === "string";
}

function requireNonBlank(value: string, message: string): string {
  const normalizedValue = value.trim();

  if (normalizedValue === "") {
    throw new ConstanciaApiError(message, 0);
  }

  return normalizedValue;
}
