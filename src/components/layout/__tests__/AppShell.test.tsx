import { fireEvent, render, screen, within } from "@testing-library/react";
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
  });

  it("muestra la identidad docente en el sidebar, sin repetirla en el header", () => {
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

  it("abre el drawer con la misma identidad, navegación y logout", () => {
    render(<AppShell title="Perfil docente">Contenido</AppShell>);
    const menuButton = screen.getByRole("button", { name: "Abrir menú de navegación" });

    expect(menuButton).toHaveAttribute("aria-controls", "app-navigation");
    expect(menuButton).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(menuButton);

    const drawer = screen.getByRole("dialog", { name: "Menú de navegación" });
    expect(menuButton).toHaveAttribute("aria-expanded", "true");
    expect(within(drawer).getByText("Docente De Prueba")).toBeInTheDocument();
    expect(within(drawer).getByRole("link", { name: /Carga académica/ })).toBeInTheDocument();
    expect(within(drawer).getByRole("link", { name: /Mis constancias/ })).toBeInTheDocument();
    expect(within(drawer).getByRole("button", { name: "Cerrar sesión" })).toBeInTheDocument();
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("cierra el drawer con el botón, Escape y una opción de navegación", () => {
    render(<AppShell title="Perfil docente">Contenido</AppShell>);
    const menuButton = screen.getByRole("button", { name: "Abrir menú de navegación" });

    fireEvent.click(menuButton);
    fireEvent.click(screen.getByRole("button", { name: "Cerrar menú de navegación" }));
    expect(menuButton).toHaveAttribute("aria-expanded", "false");
    expect(menuButton).toHaveFocus();

    fireEvent.click(menuButton);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(menuButton).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(menuButton);
    const courseLink = screen.getByRole("link", { name: /Carga académica/ });
    courseLink.addEventListener("click", (event) => event.preventDefault(), { once: true });
    fireEvent.click(courseLink);
    expect(menuButton).toHaveAttribute("aria-expanded", "false");
    expect(document.body.style.overflow).toBe("");
  });
});
