import { API_ROUTES } from "@/config/apiRoutes";
import {
  ApiError,
  httpBlob,
  httpJson,
  isRecord,
  type HttpBlobOptions,
  type HttpJsonOptions,
} from "@/lib/api/httpClient";
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

export type CertificateAccessScope = "self" | "administrative";

export async function generarConstanciaCurso(
  request: CourseCertificateRequest,
): Promise<CourseCertificateResponse> {
  return requestConstancia<CourseCertificateResponse>(API_ROUTES.teachers.certificates.course, {
    method: "POST",
    body: request,
    validate: (payload) => validateResponseEnvelope(payload, validateCourseCertificateResponse),
  });
}

export async function generarConstanciaSemestral(
  request: SemesterCertificateRequest,
): Promise<SemesterCertificateResponse> {
  return requestConstancia<SemesterCertificateResponse>(API_ROUTES.teachers.certificates.semester, {
    method: "POST",
    body: request,
    validate: (payload) => validateResponseEnvelope(payload, validateSemesterCertificateResponse),
  });
}

export async function listarConstanciasDocente(): Promise<CertificateGenerationSummary[]> {
  return requestConstancia<CertificateGenerationSummary[]>(
    API_ROUTES.teachers.certificates.root,
    {
      validate: (payload) => validateResponseEnvelope(payload, validateCertificateGenerationList),
    },
  );
}

export async function obtenerConstanciaPorGeneracion(
  generationId: string,
  scope: CertificateAccessScope = "self",
): Promise<CertificateGenerationDetail> {
  const idGeneracion = requireNonBlank(
    generationId,
    "El identificador de generacion es obligatorio",
  );

  return requestConstancia<CertificateGenerationDetail>(
    scope === "self"
      ? API_ROUTES.teachers.certificates.generation(idGeneracion)
      : API_ROUTES.certificates.generation(idGeneracion),
    {
      validate: (payload) => validateScopedResponse(
        payload,
        scope,
        validateCertificateGenerationSummary,
      ),
    },
  );
}

export async function obtenerHistorialConstancia(
  certificateKey: string,
  scope: CertificateAccessScope = "self",
): Promise<CertificateHistoryItem[]> {
  const claveConstancia = requireNonBlank(
    certificateKey,
    "La clave de constancia es obligatoria",
  );

  return requestConstancia<CertificateHistoryItem[]>(
    scope === "self"
      ? API_ROUTES.teachers.certificates.history(claveConstancia)
      : API_ROUTES.certificates.history(claveConstancia),
    {
      validate: (payload) => validateScopedResponse(
        payload,
        scope,
        validateCertificateGenerationList,
      ),
    },
  );
}

export async function obtenerPdfConstancia(
  generationId: string,
  scope: CertificateAccessScope = "self",
): Promise<Blob> {
  const idGeneracion = requireNonBlank(
    generationId,
    "El identificador de generacion es obligatorio",
  );

  return requestConstanciaBlob(
    scope === "self"
      ? API_ROUTES.teachers.certificates.pdf(idGeneracion)
      : API_ROUTES.certificates.pdf(idGeneracion),
  );
}

export async function descargarPdfConstancia(
  generationId: string,
  scope: CertificateAccessScope = "self",
): Promise<Blob> {
  const idGeneracion = requireNonBlank(
    generationId,
    "El identificador de generacion es obligatorio",
  );

  return requestConstanciaBlob(
    scope === "self"
      ? API_ROUTES.teachers.certificates.download(idGeneracion)
      : API_ROUTES.certificates.download(idGeneracion),
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

async function requestConstanciaBlob(path: string, options: HttpBlobOptions = {}): Promise<Blob> {
  try {
    return await httpBlob(path, {
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

function validateResponseEnvelope<T>(
  payload: unknown,
  validateData: (data: unknown) => T,
): T {
  if (!isRecord(payload) || payload.success !== true || !("data" in payload)) {
    throw new ApiError("La respuesta de constancias no tiene el formato esperado.", 0);
  }

  return validateData(payload.data);
}

function validateScopedResponse<T>(
  payload: unknown,
  scope: CertificateAccessScope,
  validateData: (data: unknown) => T,
): T {
  return scope === "self" ? validateResponseEnvelope(payload, validateData) : validateData(payload);
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
