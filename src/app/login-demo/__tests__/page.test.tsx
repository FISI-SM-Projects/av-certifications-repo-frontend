import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  isDemoAccessEnabled: vi.fn(),
  isDemoMode: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: (path: string) => {
    mocks.redirect(path);
    throw new Error("NEXT_REDIRECT");
  },
}));

vi.mock("@/lib/uiMode", () => ({
  isDemoAccessEnabled: () => mocks.isDemoAccessEnabled(),
  isDemoMode: () => mocks.isDemoMode(),
}));

vi.mock("@/components/auth/DemoLoginSelector", () => ({
  DemoLoginSelector: () => <div>Selector de acceso demo</div>,
}));

vi.mock("@/components/demo/DemoOnly", () => ({
  DemoOnly: ({ children }: { children: ReactNode }) => children,
}));

import LoginDemoPage from "@/app/login-demo/page";

describe("LoginDemoPage", () => {
  beforeEach(() => {
    mocks.isDemoAccessEnabled.mockReset();
    mocks.isDemoMode.mockReset();
    mocks.redirect.mockReset();
    mocks.isDemoMode.mockReturnValue(true);
  });

  it("redirige al login real cuando el acceso demo esta deshabilitado", () => {
    mocks.isDemoAccessEnabled.mockReturnValue(false);

    expect(() => LoginDemoPage()).toThrow("NEXT_REDIRECT");
    expect(mocks.redirect).toHaveBeenCalledWith("/login");
    expect(screen.queryByText("Selector de acceso demo")).not.toBeInTheDocument();
  });

  it("renderiza el selector cuando el acceso demo esta habilitado", () => {
    mocks.isDemoAccessEnabled.mockReturnValue(true);

    render(<LoginDemoPage />);

    expect(mocks.redirect).not.toHaveBeenCalled();
    expect(screen.getByText("Selector de acceso demo")).toBeInTheDocument();
  });
});
