import { ApiError, httpJson, isRecord } from "@/lib/api/httpClient";
import { API_ROUTES } from "@/config/apiRoutes";
import type { PerfilDocenteResponse } from "@/types/docente/perfilDocente.types";
import { listarConstanciasDocente } from "@/services/constancia/constanciaService";

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
    const constancias = await listarConstanciasDocente(codigoDocente);
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
