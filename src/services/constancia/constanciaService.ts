import { isCertificateStatus } from "@/types/constancia/constancia.types";
import { API_BASE_URL } from "@/lib/api";
import { API_ROUTES } from "@/config/apiRoutes";
import { ApiError, httpBlob, httpJson, isRecord, type HttpJsonOptions } from "@/lib/api/httpClient";
import type { PaginatedApiEnvelope } from "@/types/api.types";
import type {
  CertificateApiResponse,
  CertificateGenerationDetail,
  CertificateGenerationSummary,
  CertificateHistoryItem,
  CreateCertificateApiRequest,
  SemesterCertificateRequest,
  SemesterCertificateResponse,
} from "@/types/constancia/constancia.types";
import {
  ConstanciaApiError,
  type MissingCourse,
} from "@/types/constancia/constancia-error.types";

const ERROR_CONEXION = "No se pudo conectar con el backend de constancias";
const ERROR_SOLICITUD = "No se pudo completar la solicitud de constancias";

export async function generarConstanciaSemestral(
  request: SemesterCertificateRequest,
): Promise<SemesterCertificateResponse> {
  const body: CreateCertificateApiRequest = {
    certificateType: "SEMESTER",
    teacherCode: request.teacher_code,
    semester: request.semester,
    confirmIncomplete: request.confirmIncomplete,
  };

  return requestConstancia<SemesterCertificateResponse>(API_ROUTES.CERTIFICATES, {
    method: "POST",
    body,
    validate: (payload) => mapCertificateToSemesterResponse(validateCertificateEnvelope(payload)),
  });
}

export async function listarConstanciasDocente(
  teacherCode: string,
): Promise<CertificateGenerationSummary[]> {
  const codigoDocente = requireNonBlank(teacherCode, "El codigo docente es obligatorio");

  return requestConstancia<CertificateGenerationSummary[]>(certificateListPath(codigoDocente), {
    validate: (payload) => validateCertificatePage(payload).map(mapCertificateToSummary),
  });
}

export async function listarConstancias(
  filters: CertificateListFilters = {},
): Promise<CertificateGenerationSummary[]> {
  return requestConstancia<CertificateGenerationSummary[]>(certificateListFiltersPath(filters), {
    validate: (payload) => validateCertificatePage(payload).map(mapCertificateToSummary),
  });
}

export async function firmarConstancia(generationId: string): Promise<CertificateGenerationSummary> {
  const idGeneracion = requireNonBlank(
    generationId,
    "El identificador de generacion es obligatorio",
  );

  return requestConstancia<CertificateGenerationSummary>(
    API_ROUTES.certificateSignature(idGeneracion),
    {
      method: "POST",
      validate: (payload) => mapCertificateToSummary(validateCertificateEnvelope(payload)),
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

  return requestConstancia<CertificateGenerationDetail>(API_ROUTES.certificateById(idGeneracion), {
    validate: (payload) => mapCertificateToSummary(validateCertificateEnvelope(payload)),
  });
}

export async function obtenerHistorialConstancia(
  certificateKey: string,
): Promise<CertificateHistoryItem[]> {
  const claveConstancia = requireNonBlank(
    certificateKey,
    "La clave de constancia es obligatoria",
  );

  if (!/^\d+$/.test(claveConstancia)) {
    throw new ConstanciaApiError("El historial oficial requiere el identificador numerico de la constancia.", 0);
  }

  return requestConstancia<CertificateHistoryItem[]>(API_ROUTES.certificateVersions(claveConstancia), {
    validate: (payload) => validateCertificatePage(payload).map(mapCertificateToSummary),
  });
}

export function construirUrlVisualizacionPdf(generationId: string): string {
  const idGeneracion = requireNonBlank(
    generationId,
    "El identificador de generacion es obligatorio",
  );

  return `${API_BASE_URL}${API_ROUTES.certificateDocument(idGeneracion, "inline")}`;
}

export function construirUrlDescargaPdf(generationId: string): string {
  const idGeneracion = requireNonBlank(
    generationId,
    "El identificador de generacion es obligatorio",
  );

  return `${API_BASE_URL}${API_ROUTES.certificateDocument(idGeneracion, "attachment")}`;
}

export async function obtenerPdfConstancia(generationId: string): Promise<Blob> {
  const idGeneracion = requireNonBlank(
    generationId,
    "El identificador de generacion es obligatorio",
  );

  return requestConstanciaBlob(
    API_ROUTES.certificateDocument(idGeneracion, "inline"),
  );
}

export async function descargarPdfConstancia(generationId: string): Promise<Blob> {
  const idGeneracion = requireNonBlank(
    generationId,
    "El identificador de generacion es obligatorio",
  );

  return requestConstanciaBlob(
    API_ROUTES.certificateDocument(idGeneracion, "attachment"),
  );
}

export function mapCertificateToSummary(certificate: CertificateApiResponse): CertificateGenerationSummary {
  const documentUrl = API_ROUTES.certificateDocument(String(certificate.id), "inline");
  return {
    generationId: String(certificate.id),
    certificateKey: certificate.certificateKey,
    version: certificate.version,
    type: certificate.certificateType === "SEMESTER" ? "SEMESTRAL" : "CURSO",
    certificateType: certificate.certificateType,
    status: certificate.status,
    teacherCode: certificate.teacherCode,
    courseCode: certificate.course?.code ?? null,
    courseSubject: certificate.course?.name,
    section: certificate.section === null ? null : String(certificate.section),
    semester: certificate.semester,
    generatedAt: certificate.generatedAt,
    viewUrl: documentUrl,
    downloadUrl: API_ROUTES.certificateDocument(String(certificate.id), "attachment"),
    pdfAvailable: certificate.pdfAvailable,
  };
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

function mapCertificateToSemesterResponse(certificate: CertificateApiResponse): SemesterCertificateResponse {
  const summary = mapCertificateToSummary(certificate);
  if (summary.certificateType !== "SEMESTER") {
    throw new ApiError("La respuesta de generacion semestral no es valida.", 0);
  }
  return {
    generationId: summary.generationId,
    certificateKey: summary.certificateKey,
    version: summary.version,
    type: "SEMESTRAL",
    certificateType: "SEMESTER",
    status: summary.status,
    teacherCode: summary.teacherCode,
    teacherFullName: certificate.teacherFullName,
    semester: summary.semester,
    generatedAt: summary.generatedAt ?? "",
    viewUrl: summary.viewUrl,
    downloadUrl: summary.downloadUrl,
  };
}

function validateCertificateEnvelope(payload: unknown): CertificateApiResponse {
  if (!isRecord(payload) || payload.success !== true || !isCertificateApiResponse(payload.data)) {
    throw new ApiError("La constancia no tiene el formato esperado.", 0);
  }

  return payload.data;
}

function validateCertificatePage(payload: unknown): CertificateApiResponse[] {
  if (
    !isRecord(payload) ||
    payload.success !== true ||
    !Array.isArray(payload.data) ||
    !payload.data.every(isCertificateApiResponse)
  ) {
    throw new ApiError("La lista de constancias no tiene el formato esperado.", 0);
  }

  return (payload as PaginatedApiEnvelope<CertificateApiResponse[]>).data;
}

function isCertificateApiResponse(value: unknown): value is CertificateApiResponse {
  if (!isRecord(value)) {
    return false;
  }

  return (
    Number.isSafeInteger(value.id) &&
    typeof value.certificateKey === "string" &&
    (value.certificateType === "COURSE" || value.certificateType === "SEMESTER") &&
    isCertificateStatus(value.status) &&
    Number.isSafeInteger(value.version) &&
    Number.isSafeInteger(value.teacherId) &&
    typeof value.teacherCode === "string" &&
    typeof value.teacherFullName === "string" &&
    Number.isSafeInteger(value.academicPeriodId) &&
    typeof value.semester === "string" &&
    (value.academicWorkloadId === null || Number.isSafeInteger(value.academicWorkloadId)) &&
    (value.course === null || (isRecord(value.course) && Number.isSafeInteger(value.course.id)
      && typeof value.course.code === "string" && typeof value.course.name === "string")) &&
    (value.section === null || Number.isSafeInteger(value.section)) &&
    (value.cycle === null || Number.isSafeInteger(value.cycle)) &&
    (value.school === null || typeof value.school === "string") &&
    (value.plan === null || Number.isSafeInteger(value.plan)) &&
    (value.generatedAt === null || typeof value.generatedAt === "string") &&
    (value.signedAt === null || typeof value.signedAt === "string") &&
    typeof value.pdfAvailable === "boolean" &&
    typeof value.documentUrl === "string"
  );
}

function certificateListPath(teacherCode: string): string {
  const params = new URLSearchParams({
    teacherCode,
    page: "0",
    size: "50",
  });
  return `${API_ROUTES.CERTIFICATES}?${params.toString()}`;
}

function certificateListFiltersPath(filters: CertificateListFilters): string {
  const params = new URLSearchParams({
    page: String(filters.page ?? 0),
    size: String(filters.size ?? 50),
  });

  if (filters.teacherCode !== undefined && filters.teacherCode.trim() !== "") {
    params.set("teacherCode", filters.teacherCode.trim());
  }
  if (filters.certificateType !== undefined) {
    params.set("certificateType", filters.certificateType);
  }
  if (filters.status !== undefined) {
    params.set("status", filters.status);
  }
  if (filters.semester !== undefined && filters.semester.trim() !== "") {
    params.set("semester", filters.semester.trim());
  }
  if (filters.course !== undefined && filters.course.trim() !== "") {
    params.set("course", filters.course.trim());
  }

  return `${API_ROUTES.CERTIFICATES}?${params.toString()}`;
}

function isMissingCourse(value: unknown): value is MissingCourse {
  if (!isRecord(value)) {
    return false;
  }

  return typeof value.code === "string" && typeof value.section === "string";
}

export type CertificateListFilters = {
  teacherCode?: string;
  certificateType?: "COURSE" | "SEMESTER";
  status?: "GENERADA" | "FIRMADA";
  semester?: string;
  course?: string;
  page?: number;
  size?: number;
};

function requireNonBlank(value: string, message: string): string {
  const normalizedValue = value.trim();

  if (normalizedValue === "") {
    throw new ConstanciaApiError(message, 0);
  }

  return normalizedValue;
}
