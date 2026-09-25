import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  isDemoAccessEnabled: vi.fn(),
  logout: vi.fn(),
  push: vi.fn(),
  useAuth: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
}));

vi.mock("@/context/auth/AuthProvider", () => ({
  useAuth: () => mocks.useAuth(),
}));

vi.mock("@/lib/uiMode", () => ({
  isDemoAccessEnabled: () => mocks.isDemoAccessEnabled(),
}));

import { LogoutButton } from "@/components/auth/LogoutButton";

describe("LogoutButton", () => {
  beforeEach(() => {
    mocks.isDemoAccessEnabled.mockReset();
    mocks.logout.mockReset();
    mocks.push.mockReset();
    mocks.useAuth.mockReset();
  });

  it("envia la sesion backend al login real", () => {
    mocks.isDemoAccessEnabled.mockReturnValue(true);
    renderLogout({ token: "jwt", user: null });

    clickLogout();

    expect(mocks.logout).toHaveBeenCalledOnce();
    expect(mocks.push).toHaveBeenCalledWith("/login");
  });

  it("devuelve una sesion legacy al login demo cuando esta habilitado", () => {
    mocks.isDemoAccessEnabled.mockReturnValue(true);
    renderLogout({ token: null, user: { role: "DIRECTOR" } });

    clickLogout();

    expect(mocks.push).toHaveBeenCalledWith("/login-demo");
  });

  it("envia una sesion legacy al login real fuera del acceso demo", () => {
    mocks.isDemoAccessEnabled.mockReturnValue(false);
    renderLogout({ token: null, user: { role: "DIRECTOR" } });

    clickLogout();

    expect(mocks.push).toHaveBeenCalledWith("/login");
  });
});

function renderLogout({ token, user }: { token: string | null; user: object | null }): void {
  mocks.useAuth.mockReturnValue({ logout: mocks.logout, token, user });
  render(<LogoutButton />);
}

function clickLogout(): void {
  fireEvent.click(screen.getByRole("button", { name: "Cerrar sesión" }));
}
