import { API_BASE_URL } from "@/lib/api";
import type { PerfilDocenteResponse } from "../types/perfilDocente.types";

export async function obtenerPerfilDocente(): Promise<PerfilDocenteResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/docentes/demo/perfil`,
    {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    },
  );

  if (!response.ok) {
    throw new Error(
      `No se pudo obtener el perfil docente. Codigo HTTP: ${response.status}`,
    );
  }

  return (await response.json()) as PerfilDocenteResponse;
}
