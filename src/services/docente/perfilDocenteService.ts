import { isCertificateStatus } from "@/types/constancia/constancia.types";
import { ApiError, httpJson, isRecord } from "@/lib/api/httpClient";
import { API_ROUTES } from "@/config/apiRoutes";
import type { PerfilDocenteResponse } from "@/types/docente/perfilDocente.types";

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
    const teacher = await httpJson<TeacherMeData>(
      API_ROUTES.TEACHER_ME,
      {
        networkErrorMessage: ERROR_CONEXION,
        defaultErrorMessage: "No se pudo obtener el perfil docente.",
        validate: validateTeacherMeEnvelope,
      },
    );
    const constancias = await httpJson<PerfilDocenteResponse["constancias"]>(
      API_ROUTES.legacyTeacherCertificates(codigoDocente),
      {
        networkErrorMessage: ERROR_CONEXION,
        defaultErrorMessage: "No se pudo obtener las constancias del docente.",
        validate: validateConstanciaPerfilList,
      },
    );
    return {
      docente: {
        id: teacher.id,
        codigo: teacher.code,
        nombres: teacher.firstName,
        apellidos: `${teacher.paternalLastName}${teacher.maternalLastName ? ` ${teacher.maternalLastName}` : ""}`,
        correoInstitucional: teacher.email,
        departamentoAcademico: teacher.department ?? "",
        categoria: "No registrado",
        condicion: "No registrado",
        estado: teacher.registerState,
      },
      constancias,
    };
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

type TeacherMeData = {
  id: number;
  personId: number;
  moodleId: number;
  code: string;
  dni: string | null;
  email: string;
  firstName: string;
  paternalLastName: string;
  maternalLastName: string | null;
  department: string | null;
  registerState: string;
};

function validateTeacherMeEnvelope(payload: unknown): TeacherMeData {
  if (!isRecord(payload) || payload.success !== true || !isRecord(payload.data)) {
    throw new ApiError("La respuesta del perfil docente no es valida.", 0);
  }

  const data = payload.data;
  if (!Number.isSafeInteger(data.id) || !Number.isSafeInteger(data.personId)
    || !Number.isSafeInteger(data.moodleId) || typeof data.code !== "string"
    || !(data.dni === null || typeof data.dni === "string")
    || typeof data.email !== "string" || typeof data.firstName !== "string"
    || typeof data.paternalLastName !== "string"
    || !(data.maternalLastName === null || typeof data.maternalLastName === "string")
    || !(data.department === null || typeof data.department === "string")
    || typeof data.registerState !== "string") {
    throw new ApiError("La respuesta del perfil docente no es valida.", 0);
  }
  return data as TeacherMeData;
}

function validateConstanciaPerfilList(payload: unknown): PerfilDocenteResponse["constancias"] {
  if (!Array.isArray(payload) || !payload.every(isConstanciaPerfil)) {
    throw new ApiError("La lista de constancias del perfil no es valida.", 0);
  }
  return payload as PerfilDocenteResponse["constancias"];
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
    isCertificateStatus(value.status) &&
    typeof value.teacherCode === "string" &&
    (typeof value.courseCode === "string" || value.courseCode === null) &&
    (typeof value.section === "string" || value.section === null) &&
    typeof value.semester === "string" &&
    (typeof value.generatedAt === "string" || value.generatedAt === null) &&
    typeof value.viewUrl === "string" &&
    typeof value.downloadUrl === "string"
  );
}
