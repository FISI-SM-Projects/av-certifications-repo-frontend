import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const authMocks = vi.hoisted(() => ({ useAuth: vi.fn() }));

vi.mock("@/context/auth/AuthProvider", () => ({
  useAuth: () => authMocks.useAuth(),
}));

vi.mock("@/lib/uiMode", () => ({ isDemoMode: () => false }));

vi.mock("next/navigation", () => ({
  usePathname: () => "/perfil-docente",
  useRouter: () => ({ push: vi.fn() }),
}));

import { AppShell } from "@/components/layout/AppShell";

describe("AppShell", () => {
  beforeEach(() => {
    authMocks.useAuth.mockReset();
  });

  it("muestra la identidad docente en el sidebar, sin repetirla en el header", () => {
    authMocks.useAuth.mockReturnValue({
      user: null,
      teacher: {
        firstName: "Docente",
        paternalLastName: "De",
        maternalLastName: "Prueba",
        department: "CC",
      },
      roles: ["DOCENTE"],
      isLoading: false,
      isAuthenticated: true,
      token: "test-token",
      logout: vi.fn(),
    });

    render(<AppShell title="Perfil docente">Contenido</AppShell>);

    const sidebar = screen.getByRole("complementary");
    const header = screen.getByRole("banner");
    expect(within(sidebar).getByText("Docente De Prueba")).toBeInTheDocument();
    expect(within(sidebar).getByText("DOCENTE")).toBeInTheDocument();
    expect(within(sidebar).getByText("CC")).toBeInTheDocument();
    expect(within(header).queryByText("Docente De Prueba")).not.toBeInTheDocument();
    expect(within(header).queryByText("DOCENTE")).not.toBeInTheDocument();
    expect(within(header).getByRole("heading", { name: "Perfil docente" })).toBeInTheDocument();
    expect(within(sidebar).getByRole("link", { name: /Carga académica/ })).toHaveAttribute("href", "/carga-academica");
    const logout = within(sidebar).getByRole("button", { name: "Cerrar sesión" });
    expect(logout).toBeInTheDocument();
    expect(logout.parentElement).toHaveTextContent(/^Cerrar sesión$/);
    expect(screen.queryByTitle("Tema institucional")).not.toBeInTheDocument();
  });
});
