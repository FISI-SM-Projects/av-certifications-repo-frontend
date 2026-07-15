import { API_BASE_URL } from "@/lib/api";
import type { PerfilDocenteResponse } from "@/features/perfil-docente/types/perfilDocente.types";
import type { DirectorDocenteListado } from "@/features/director/types/director.types";

type ErrorResponse = {
  message?: string;
};

async function obtenerMensajeError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as ErrorResponse;

    if (typeof data.message === "string" && data.message.trim() !== "") {
      return data.message;
    }
  } catch {
    // Si no hay JSON de error, se devuelve un mensaje generico.
  }

  return "No se pudo completar la solicitud";
}

export async function obtenerDocentesPorDepartamento(
  departamentoAcademico: string,
): Promise<DirectorDocenteListado[]> {
  const departamento = encodeURIComponent(departamentoAcademico);
  const response = await fetch(
    `${API_BASE_URL}/api/v1/director/docentes?departamentoAcademico=${departamento}`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(await obtenerMensajeError(response));
  }

  return response.json() as Promise<DirectorDocenteListado[]>;
}

export async function obtenerPerfilDocentePorCodigo(
  teacherCode: string,
): Promise<PerfilDocenteResponse> {
  const codigo = encodeURIComponent(teacherCode);
  const response = await fetch(`${API_BASE_URL}/api/v1/docentes/${codigo}/perfil`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await obtenerMensajeError(response));
  }

  return response.json() as Promise<PerfilDocenteResponse>;
}
