import { act, render, screen, waitFor } from "@testing-library/react";
import { useEffect } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const authServiceMocks = vi.hoisted(() => ({
  login: vi.fn(),
  getAuthenticatedTeacher: vi.fn(),
}));

const storageMocks = vi.hoisted(() => ({
  eliminarSesion: vi.fn(),
  getToken: vi.fn(),
  guardarSesion: vi.fn(),
  obtenerSesion: vi.fn(),
  removeToken: vi.fn(),
  saveToken: vi.fn(),
}));

vi.mock("@/services/auth/authService", () => ({
  login: authServiceMocks.login,
  getAuthenticatedTeacher: authServiceMocks.getAuthenticatedTeacher,
}));

vi.mock("@/services/auth/sessionStorage", () => storageMocks);

import { AuthProvider, useAuth } from "@/context/auth/AuthProvider";

const teacherResponse = {
  success: true,
  message: "Docente autenticado",
  data: {
    id: 1,
    personId: 10,
    moodleId: null,
    code: "DOC-001",
    dni: null,
    firstName: "Docente",
    paternalLastName: "Prueba",
    maternalLastName: null,
    department: "CC",
    registerState: "ACTIVO",
  },
};

let currentAuth: ReturnType<typeof useAuth> | null = null;

describe("AuthProvider backend session", () => {
  beforeEach(() => {
    currentAuth = null;
    authServiceMocks.login.mockReset();
    authServiceMocks.getAuthenticatedTeacher.mockReset();
    Object.values(storageMocks).forEach((mock) => mock.mockReset());
    storageMocks.getToken.mockReturnValue(null);
    storageMocks.obtenerSesion.mockReturnValue(null);
  });

  it("establece token, docente y roles backend despues del login", async () => {
    const token = createToken([
      "ROLE_DOCENTE",
      "ROLE_ADMIN",
      "ROLE_DIRECTOR_ESCUELA",
    ]);
    authServiceMocks.login.mockResolvedValue(loginResponse(token));
    authServiceMocks.getAuthenticatedTeacher.mockResolvedValue(teacherResponse);
    renderProvider();
    await waitUntilInitialized();

    await act(async () => {
      await getCurrentAuth().loginWithCredentials({ username: "docente", password: "secret" });
    });

    expect(storageMocks.saveToken).toHaveBeenCalledWith(token);
    expect(authServiceMocks.getAuthenticatedTeacher).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
    expect(screen.getByTestId("token")).toHaveTextContent(token);
    expect(screen.getByTestId("teacher")).toHaveTextContent("DOC-001");
    expect(screen.getByTestId("roles")).toHaveTextContent(
      "DOCENTE,ADMIN,DIRECTOR_ESCUELA",
    );
    expect(screen.getByTestId("roles")).not.toHaveTextContent(/^DIRECTOR$/);
  });

  it("rechaza authorities desconocidas y no deja una sesion parcial", async () => {
    const token = createToken(["ROLE_DESCONOCIDO"]);
    authServiceMocks.login.mockResolvedValue(loginResponse(token));
    authServiceMocks.getAuthenticatedTeacher.mockResolvedValue(teacherResponse);
    renderProvider();
    await waitUntilInitialized();

    let loginError: unknown;
    await act(async () => {
      try {
        await getCurrentAuth().loginWithCredentials({ username: "docente", password: "secret" });
      } catch (error) {
        loginError = error;
      }
    });

    expect(loginError).toBeInstanceOf(Error);
    expect((loginError as Error).message).toBe("El JWT contiene un rol no reconocido.");
    expect(storageMocks.removeToken).toHaveBeenCalled();
    expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
    expect(screen.getByTestId("token")).toHaveTextContent("none");
  });

  it("restaura una sesion backend almacenada", async () => {
    const token = createToken(["ROLE_DOCENTE"]);
    storageMocks.getToken.mockReturnValue(token);
    authServiceMocks.getAuthenticatedTeacher.mockResolvedValue(teacherResponse);

    renderProvider();

    await waitFor(() => expect(screen.getByTestId("authenticated")).toHaveTextContent("true"));
    expect(screen.getByTestId("loading")).toHaveTextContent("false");
    expect(screen.getByTestId("teacher")).toHaveTextContent("DOC-001");
    expect(screen.getByTestId("roles")).toHaveTextContent("DOCENTE");
  });

  it("limpia un token almacenado cuando falla la restauracion", async () => {
    storageMocks.getToken.mockReturnValue(createToken(["ROLE_DOCENTE"]));
    authServiceMocks.getAuthenticatedTeacher.mockRejectedValue(new Error("Perfil no disponible"));

    renderProvider();

    await waitUntilInitialized();
    expect(storageMocks.removeToken).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
    expect(screen.getByTestId("teacher")).toHaveTextContent("none");
  });

  it("logout elimina storage y limpia el contexto backend", async () => {
    const token = createToken(["ROLE_DOCENTE"]);
    storageMocks.getToken.mockReturnValue(token);
    authServiceMocks.getAuthenticatedTeacher.mockResolvedValue(teacherResponse);
    renderProvider();
    await waitFor(() => expect(screen.getByTestId("authenticated")).toHaveTextContent("true"));

    act(() => getCurrentAuth().logout());

    expect(storageMocks.removeToken).toHaveBeenCalled();
    expect(storageMocks.eliminarSesion).toHaveBeenCalled();
    expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
    expect(screen.getByTestId("token")).toHaveTextContent("none");
    expect(screen.getByTestId("roles")).toHaveTextContent("none");
  });
});

function AuthConsumer() {
  const auth = useAuth();

  useEffect(() => {
    currentAuth = auth;
  }, [auth]);

  return (
    <>
      <span data-testid="loading">{String(auth.isLoading)}</span>
      <span data-testid="authenticated">{String(auth.isAuthenticated)}</span>
      <span data-testid="token">{auth.token ?? "none"}</span>
      <span data-testid="teacher">{auth.teacher?.code ?? "none"}</span>
      <span data-testid="roles">{auth.roles.join(",") || "none"}</span>
    </>
  );
}

function renderProvider(): void {
  render(
    <AuthProvider>
      <AuthConsumer />
    </AuthProvider>,
  );
}

async function waitUntilInitialized(): Promise<void> {
  await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"));
}

function getCurrentAuth(): ReturnType<typeof useAuth> {
  if (currentAuth === null) {
    throw new Error("AuthProvider no inicializado en el test.");
  }
  return currentAuth;
}

function createToken(roles: string[]): string {
  const payload = btoa(JSON.stringify({ roles }))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return `header.${payload}.signature`;
}

function loginResponse(token: string) {
  return {
    success: true,
    message: "Inicio de sesion correcto",
    data: { type: "Bearer", token },
  };
}
