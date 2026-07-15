import { API_BASE_URL } from "@/lib/api";
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
  type ConstanciaApiErrorBody,
  type MissingCourse,
} from "@/features/constancias/types/constancia-error.types";

const ERROR_CONEXION = "No se pudo conectar con el backend de constancias";
const ERROR_SOLICITUD = "No se pudo completar la solicitud de constancias";

export async function generarConstanciaCurso(
  request: CourseCertificateRequest,
): Promise<CourseCertificateResponse> {
  const response = await safeFetch(`${API_BASE_URL}/api/v1/constancias/curso`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
    cache: "no-store",
  });

  return parseJsonResponse<CourseCertificateResponse>(response);
}

export async function generarConstanciaSemestral(
  request: SemesterCertificateRequest,
): Promise<SemesterCertificateResponse> {
  const response = await safeFetch(`${API_BASE_URL}/api/v1/constancias/semestral`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
    cache: "no-store",
  });

  return parseJsonResponse<SemesterCertificateResponse>(response);
}

export async function listarConstanciasDocente(
  teacherCode: string,
): Promise<CertificateGenerationSummary[]> {
  const codigoDocente = requireNonBlank(teacherCode, "El código docente es obligatorio");
  const response = await safeFetch(
    `${API_BASE_URL}/api/v1/constancias/docentes/${encodeURIComponent(codigoDocente)}`,
    {
      cache: "no-store",
    },
  );

  return parseJsonResponse<CertificateGenerationSummary[]>(response);
}

export async function obtenerConstanciaPorGeneracion(
  generationId: string,
): Promise<CertificateGenerationDetail> {
  const idGeneracion = requireNonBlank(
    generationId,
    "El identificador de generación es obligatorio",
  );
  const response = await safeFetch(
    `${API_BASE_URL}/api/v1/constancias/generaciones/${encodeURIComponent(idGeneracion)}`,
    {
      cache: "no-store",
    },
  );

  return parseJsonResponse<CertificateGenerationDetail>(response);
}

export async function obtenerHistorialConstancia(
  certificateKey: string,
): Promise<CertificateHistoryItem[]> {
  const claveConstancia = requireNonBlank(
    certificateKey,
    "La clave de constancia es obligatoria",
  );
  const response = await safeFetch(
    `${API_BASE_URL}/api/v1/constancias/certificados/${encodeURIComponent(claveConstancia)}/historial`,
    {
      cache: "no-store",
    },
  );

  return parseJsonResponse<CertificateHistoryItem[]>(response);
}

export function construirUrlVisualizacionPdf(generationId: string): string {
  const idGeneracion = requireNonBlank(
    generationId,
    "El identificador de generación es obligatorio",
  );

  return `${API_BASE_URL}/api/v1/constancias/generaciones/${encodeURIComponent(idGeneracion)}/pdf`;
}

export function construirUrlDescargaPdf(generationId: string): string {
  const idGeneracion = requireNonBlank(
    generationId,
    "El identificador de generación es obligatorio",
  );

  return `${API_BASE_URL}/api/v1/constancias/generaciones/${encodeURIComponent(idGeneracion)}/download`;
}

async function safeFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(input, init);
  } catch {
    throw new ConstanciaApiError(ERROR_CONEXION, 0);
  }
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    return response.json() as Promise<T>;
  }

  const errorBody = await readErrorBody(response);
  throw new ConstanciaApiError(
    errorBody.message ?? ERROR_SOLICITUD,
    response.status,
    errorBody.missingFields,
    errorBody.missingCourses,
  );
}

async function readErrorBody(response: Response): Promise<ConstanciaApiErrorBody> {
  try {
    const data = (await response.json()) as ConstanciaApiErrorBody;
    const message = typeof data.message === "string" && data.message.trim() !== ""
      ? data.message
      : undefined;
    const missingFields = Array.isArray(data.missingFields)
      ? data.missingFields.filter((field): field is string => typeof field === "string")
      : undefined;
    const missingCourses = Array.isArray(data.missingCourses)
      ? data.missingCourses.filter(isMissingCourse)
      : undefined;

    return { message, missingFields, missingCourses };
  } catch {
    return { message: ERROR_SOLICITUD };
  }
}

function isMissingCourse(value: unknown): value is MissingCourse {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const course = value as Partial<MissingCourse>;
  return typeof course.code === "string" && typeof course.section === "string";
}

function requireNonBlank(value: string, message: string): string {
  const normalizedValue = value.trim();

  if (normalizedValue === "") {
    throw new ConstanciaApiError(message, 0);
  }

  return normalizedValue;
}
