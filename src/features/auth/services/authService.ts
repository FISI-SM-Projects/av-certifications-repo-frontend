import { API_BASE_URL } from "@/lib/api";
import type {
  DemoLoginRequest,
  DemoLoginResponse,
  UsuarioSesion,
} from "@/features/auth/types/auth.types";

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
    // Si el backend no responde JSON, usamos un mensaje generico.
  }

  return "No se pudo completar la solicitud";
}

export async function obtenerUsuariosDemo(): Promise<UsuarioSesion[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/demo-users`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await obtenerMensajeError(response));
  }

  return response.json() as Promise<UsuarioSesion[]>;
}

export async function loginDemo(email: string): Promise<DemoLoginResponse> {
  const request: DemoLoginRequest = { email };

  const response = await fetch(`${API_BASE_URL}/api/v1/auth/demo-login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await obtenerMensajeError(response));
  }

  return response.json() as Promise<DemoLoginResponse>;
}
