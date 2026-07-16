import { ApiError, httpJson, isRecord } from "@/lib/api/httpClient";
import type { PerfilDocenteResponse } from "@/features/perfil-docente/types/perfilDocente.types";
import type { DirectorDocenteListado } from "@/features/director/types/director.types";

export async function obtenerDocentesPorDepartamento(
  departamentoAcademico: string,
): Promise<DirectorDocenteListado[]> {
  const departamento = encodeURIComponent(departamentoAcademico.trim());

  return httpJson<DirectorDocenteListado[]>(
    `/api/v1/director/docentes?departamentoAcademico=${departamento}`,
    {
      validate: validateDirectorDocenteList,
    },
  );
}

export async function obtenerPerfilDocentePorCodigo(
  teacherCode: string,
): Promise<PerfilDocenteResponse> {
  const codigo = encodeURIComponent(teacherCode.trim());

  return httpJson<PerfilDocenteResponse>(`/api/v1/docentes/${codigo}/perfil`, {
    validate: validatePerfilDocenteResponse,
  });
}

function validateDirectorDocenteList(payload: unknown): DirectorDocenteListado[] {
  if (!Array.isArray(payload) || !payload.every(isDirectorDocenteListado)) {
    throw new ApiError("La lista de docentes no tiene el formato esperado.", 0);
  }

  return payload;
}

function isDirectorDocenteListado(value: unknown): value is DirectorDocenteListado {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.teacherCode === "string" &&
    typeof value.nombres === "string" &&
    typeof value.apellidos === "string" &&
    typeof value.correoInstitucional === "string" &&
    typeof value.departamentoAcademico === "string" &&
    typeof value.categoria === "string" &&
    typeof value.condicion === "string"
  );
}

function validatePerfilDocenteResponse(payload: unknown): PerfilDocenteResponse {
  if (!isRecord(payload) || !isRecord(payload.docente) || !Array.isArray(payload.constancias)) {
    throw new ApiError("El perfil docente no tiene el formato esperado.", 0);
  }

  return payload as PerfilDocenteResponse;
}
