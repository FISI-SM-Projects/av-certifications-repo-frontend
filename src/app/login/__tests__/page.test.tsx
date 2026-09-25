import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const authMocks = vi.hoisted(() => ({
  loginWithCredentials: vi.fn(),
}));

const navigationMocks = vi.hoisted(() => ({
  replace: vi.fn(),
}));

vi.mock("@/context/auth/AuthProvider", () => ({
  useAuth: () => ({ loginWithCredentials: authMocks.loginWithCredentials }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: navigationMocks.replace }),
}));

import LoginPage from "@/app/login/page";
import { ApiError } from "@/lib/api/httpClient";

describe("LoginPage", () => {
  beforeEach(() => {
    authMocks.loginWithCredentials.mockReset();
    navigationMocks.replace.mockReset();
  });

  it("renderiza usuario, contrasena y submit", () => {
    render(<LoginPage />);

    expect(screen.getByLabelText("Usuario")).toBeInTheDocument();
    expect(screen.getByLabelText("Contraseña")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ingresar" })).toBeInTheDocument();
  });

  it("no envia el login cuando faltan campos", () => {
    render(<LoginPage />);

    fireEvent.submit(getLoginForm());

    expect(authMocks.loginWithCredentials).not.toHaveBeenCalled();
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Ingresa tu usuario y contraseña.");
    expect(alert).not.toHaveAttribute("aria-live");
  });

  it("redirige una sola vez despues de un login correcto", async () => {
    authMocks.loginWithCredentials.mockResolvedValue(undefined);
    render(<LoginPage />);
    fillCredentials();

    fireEvent.submit(getLoginForm());

    await waitFor(() => {
      expect(navigationMocks.replace).toHaveBeenCalledWith("/perfil-docente");
    });
    expect(authMocks.loginWithCredentials).toHaveBeenCalledTimes(1);
    expect(authMocks.loginWithCredentials).toHaveBeenCalledWith({
      username: "docente",
      password: "secret",
    });
  });

  it("bloquea submits repetidos mientras el login esta pendiente", async () => {
    let resolveLogin: (() => void) | null = null;
    authMocks.loginWithCredentials.mockImplementation(
      () => new Promise<void>((resolve) => { resolveLogin = resolve; }),
    );
    render(<LoginPage />);
    fillCredentials();
    const form = getLoginForm();

    fireEvent.submit(form);
    fireEvent.submit(form);

    expect(authMocks.loginWithCredentials).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Iniciando sesión..." })).toBeDisabled();

    await act(async () => {
      resolveLogin?.();
    });
    await waitFor(() => expect(navigationMocks.replace).toHaveBeenCalledTimes(1));
  });

  it("muestra un mensaje amigable para HTTP 401", async () => {
    authMocks.loginWithCredentials.mockRejectedValue(new ApiError("Unauthorized", 401));
    render(<LoginPage />);
    fillCredentials();

    fireEvent.submit(getLoginForm());

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Usuario o contraseña incorrectos.",
    );
    expect(navigationMocks.replace).not.toHaveBeenCalled();
  });

  it("muestra un mensaje generico para otros errores", async () => {
    authMocks.loginWithCredentials.mockRejectedValue(new Error("Network failure"));
    render(<LoginPage />);
    fillCredentials();

    fireEvent.submit(getLoginForm());

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No se pudo iniciar sesión. Inténtalo nuevamente.",
    );
    expect(navigationMocks.replace).not.toHaveBeenCalled();
  });
});

function fillCredentials(): void {
  fireEvent.change(screen.getByLabelText("Usuario"), { target: { value: " docente " } });
  fireEvent.change(screen.getByLabelText("Contraseña"), { target: { value: "secret" } });
}

function getLoginForm(): HTMLFormElement {
  const form = screen.getByRole("button", { name: "Ingresar" }).closest("form");
  if (!(form instanceof HTMLFormElement)) {
    throw new Error("No se encontro el formulario de login.");
  }
  return form;
}
