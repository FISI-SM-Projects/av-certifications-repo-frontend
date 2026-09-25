import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  isDemoAccessEnabled: vi.fn(),
  replace: vi.fn(),
  useAuth: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace }),
}));

vi.mock("@/context/auth/AuthProvider", () => ({
  useAuth: () => mocks.useAuth(),
}));

vi.mock("@/lib/uiMode", () => ({
  isDemoAccessEnabled: () => mocks.isDemoAccessEnabled(),
}));

import { RequireRole } from "@/guards/auth/RequireRole";

describe("RequireRole", () => {
  beforeEach(() => {
    mocks.isDemoAccessEnabled.mockReset();
    mocks.replace.mockReset();
    mocks.useAuth.mockReset();
    mocks.useAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      logout: vi.fn(),
      roles: [],
      token: null,
      user: { role: "DIRECTOR" },
    });
  });

  it("ofrece volver al login demo cuando el acceso esta habilitado", () => {
    mocks.isDemoAccessEnabled.mockReturnValue(true);

    render(<RequireRole allowedRoles={["DOCENTE"]}>Contenido</RequireRole>);

    expect(screen.getByRole("link", { name: "Volver al login demo" })).toHaveAttribute(
      "href",
      "/login-demo",
    );
  });

  it("ofrece volver al login real cuando el acceso demo esta deshabilitado", () => {
    mocks.isDemoAccessEnabled.mockReturnValue(false);

    render(<RequireRole allowedRoles={["DOCENTE"]}>Contenido</RequireRole>);

    expect(screen.getByRole("link", { name: "Volver al acceso" })).toHaveAttribute(
      "href",
      "/login",
    );
  });
});
