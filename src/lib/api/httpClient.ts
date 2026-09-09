import { buildApiUrl } from "@/lib/api";
import { obtenerTokenSesion, eliminarSesion } from "@/services/auth/sessionStorage";

const DEFAULT_TIMEOUT_MS = 10_000;
const PUBLIC_API_PATHS = [
  "/api/v1/auth/login",
  "/api/v1/health",
];

export type ApiErrorOptions = {
  payload?: unknown;
  isNetworkError?: boolean;
  isTimeout?: boolean;
};

export class ApiError extends Error {
  status: number;
  payload?: unknown;
  isNetworkError: boolean;
  isTimeout: boolean;

  constructor(message: string, status: number, options: ApiErrorOptions = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = options.payload;
    this.isNetworkError = options.isNetworkError ?? false;
    this.isTimeout = options.isTimeout ?? false;
  }
}

export type HttpJsonOptions<T> = Omit<RequestInit, "body"> & {
  body?: unknown;
  timeoutMs?: number;
  validate?: (payload: unknown) => T;
  networkErrorMessage?: string;
  defaultErrorMessage?: string;
};

export async function httpJson<T>(
  path: string,
  options: HttpJsonOptions<T> = {},
): Promise<T> {
  const response = await request(path, options);

  if (!response.ok) {
    const payload = await readResponsePayload(response);
    throw new ApiError(
      extractMessage(payload) ?? options.defaultErrorMessage ?? "No se pudo completar la solicitud",
      response.status,
      { payload },
    );
  }

  const payload = await readResponsePayload(response);

  if (options.validate) {
    return options.validate(payload);
  }

  return payload as T;
}

export async function httpBlob(
  path: string,
  options: Omit<HttpJsonOptions<Blob>, "validate" | "body"> = {},
): Promise<Blob> {
  const response = await request(path, options);

  if (!response.ok) {
    const payload = await readResponsePayload(response);
    throw new ApiError(
      extractMessage(payload) ?? options.defaultErrorMessage ?? "No se pudo completar la solicitud",
      response.status,
      { payload },
    );
  }

  return response.blob();
}

async function request<T>(path: string, options: HttpJsonOptions<T>): Promise<Response> {
  const {
    body,
    headers,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    networkErrorMessage,
    signal,
    ...init
  } = options;
  delete init.validate;
  delete init.defaultErrorMessage;
  const controller = new AbortController();
  let timedOut = false;
  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  const abortExternalSignal = () => controller.abort();

  if (signal) {
    if (signal.aborted) {
      controller.abort();
    } else {
      signal.addEventListener("abort", abortExternalSignal, { once: true });
    }
  }

  try {
    const response = await fetch(buildApiUrl(path), {
      ...init,
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: init.cache ?? "no-store",
      headers: {
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
        ...authHeadersFor(path),
        ...headers,
      },
      signal: controller.signal,
    });

    if (response.status === 401 && !isPublicApiPath(path)) {
      eliminarSesion();
    }

    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      timedOut
        ? "La solicitud al backend excedio el tiempo de espera."
        : networkErrorMessage ?? "No se pudo conectar con el backend.",
      0,
      { isNetworkError: !timedOut, isTimeout: timedOut },
    );
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener("abort", abortExternalSignal);
  }
}

function authHeadersFor(path: string): Record<string, string> {
  if (isPublicApiPath(path)) {
    return {};
  }

  const token = obtenerTokenSesion();

  return token ? { Authorization: `Bearer ${token}` } : {};
}

function isPublicApiPath(path: string): boolean {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return PUBLIC_API_PATHS.some((publicPath) => normalizedPath === publicPath);
}

async function readResponsePayload(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return null;
  }

  const text = await response.text();

  if (text.trim() === "") {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    if (response.ok) {
      throw new ApiError("La respuesta del backend no es JSON valido.", response.status);
    }

    return { message: "No se pudo completar la solicitud" };
  }
}

function extractMessage(payload: unknown): string | null {
  if (!isRecord(payload) || typeof payload.message !== "string") {
    return null;
  }

  const message = payload.message.trim();
  return message === "" ? null : message;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
