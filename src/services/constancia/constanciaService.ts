import { isCertificateStatus } from "@/types/constancia/constancia.types";
import { API_BASE_URL } from "@/lib/api";
import { API_ROUTES } from "@/config/apiRoutes";
import { ApiError, httpBlob, httpJson, isRecord, type HttpJsonOptions } from "@/lib/api/httpClient";
import type {
  CertificateGenerationDetail,
  CertificateGenerationSummary,
  CertificateHistoryItem,
  CourseCertificateRequest,
  CourseCertificateResponse,
  SemesterCertificateRequest,
  SemesterCertificateResponse,
} from "@/types/constancia/constancia.types";
import {
  ConstanciaApiError,
  type MissingCourse,
} from "@/types/constancia/constancia-error.types";

const ERROR_CONEXION = "No se pudo conectar con el backend de constancias";
const ERROR_SOLICITUD = "No se pudo completar la solicitud de constancias";

export async function generarConstanciaCurso(
  request: CourseCertificateRequest,
): Promise<CourseCertificateResponse> {
  return requestConstancia<CourseCertificateResponse>(API_ROUTES.LEGACY_CERTIFICATE_COURSE, {
    method: "POST",
    body: request,
    validate: validateCourseCertificateResponse,
  });
}

export async function generarConstanciaSemestral(
  request: SemesterCertificateRequest,
): Promise<SemesterCertificateResponse> {
  return requestConstancia<SemesterCertificateResponse>(API_ROUTES.LEGACY_CERTIFICATE_SEMESTER, {
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
    API_ROUTES.legacyTeacherCertificates(codigoDocente),
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
    API_ROUTES.legacyCertificateDetail(idGeneracion),
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
    API_ROUTES.legacyCertificateHistory(claveConstancia),
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

  return `${API_BASE_URL}${API_ROUTES.legacyCertificatePdf(idGeneracion)}`;
}

export function construirUrlDescargaPdf(generationId: string): string {
  const idGeneracion = requireNonBlank(
    generationId,
    "El identificador de generacion es obligatorio",
  );

  return `${API_BASE_URL}${API_ROUTES.legacyCertificateDownload(idGeneracion)}`;
}

export async function obtenerPdfConstancia(generationId: string): Promise<Blob> {
  const idGeneracion = requireNonBlank(
    generationId,
    "El identificador de generacion es obligatorio",
  );

  return requestConstanciaBlob(
    API_ROUTES.legacyCertificatePdf(idGeneracion),
  );
}

export async function descargarPdfConstancia(generationId: string): Promise<Blob> {
  const idGeneracion = requireNonBlank(
    generationId,
    "El identificador de generacion es obligatorio",
  );

  return requestConstanciaBlob(
    API_ROUTES.legacyCertificateDownload(idGeneracion),
  );
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

async function requestConstanciaBlob(path: string): Promise<Blob> {
  try {
    return await httpBlob(path, {
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
    typeof payload.teacherFullName !== "string"
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
    (value.certificateType === undefined || value.certificateType === "COURSE" || value.certificateType === "SEMESTER") &&
    isCertificateStatus(value.status) &&
    typeof value.semester === "string" &&
    (typeof value.generatedAt === "string" || value.generatedAt === null) &&
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
