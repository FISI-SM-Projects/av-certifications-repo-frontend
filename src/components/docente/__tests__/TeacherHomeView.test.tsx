import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { TeacherHomeView } from "@/components/docente/TeacherHomeView";
import { useAuth } from "@/context/auth/AuthProvider";
import { listarConstanciasDocente } from "@/services/constancia/constanciaService";
import { getAuthenticatedTeacherCourses } from "@/services/docente/academicWorkloadService";

vi.mock("@/context/auth/AuthProvider", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/services/docente/academicWorkloadService", () => ({
  getAuthenticatedTeacherCourses: vi.fn(),
}));

vi.mock("@/services/constancia/constanciaService", () => ({
  listarConstanciasDocente: vi.fn(),
}));

const mockedUseAuth = vi.mocked(useAuth);
const mockedGetCourses = vi.mocked(getAuthenticatedTeacherCourses);
const mockedListCertificates = vi.mocked(listarConstanciasDocente);

function mockAuthenticatedTeacher() {
  mockedUseAuth.mockReturnValue({
    teacher: { id: 1 },
    isLoading: false,
  } as ReturnType<typeof useAuth>);
}

describe("TeacherHomeView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthenticatedTeacher();
    mockedGetCourses.mockResolvedValue({
      success: true,
      message: "ok",
      data: [],
      pagination: {
        pageNumber: 0,
        pageSize: 1,
        totalElements: 6,
        totalPages: 6,
        numberOfElements: 1,
      },
    });
    mockedListCertificates.mockResolvedValue([
      { generationId: 1 },
      { generationId: 2 },
      { generationId: 3 },
    ] as Awaited<ReturnType<typeof listarConstanciasDocente>>);
  });

  it("muestra métricas reales y accesos principales", async () => {
    render(<TeacherHomeView />);

    expect(
      screen.getByRole("heading", { name: "Tu actividad" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Ver carga académica" }),
    ).toHaveAttribute("href", "/carga-academica");
    expect(
      screen.getByRole("link", { name: "Ir a mis constancias" }),
    ).toHaveAttribute("href", "/constancias");

    await waitFor(() => {
      expect(screen.getByText("6")).toBeInTheDocument();
      expect(screen.getByText("3")).toBeInTheDocument();
    });

    expect(mockedGetCourses).toHaveBeenCalledWith(
      { page: 0, size: 1 },
      expect.any(AbortSignal),
    );
    expect(mockedListCertificates).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("DNI")).not.toBeInTheDocument();
    expect(screen.queryByText("Moodle ID")).not.toBeInTheDocument();
  });

  it("mantiene disponible el resto del inicio si falla una fuente", async () => {
    mockedGetCourses
      .mockRejectedValueOnce(new Error("courses unavailable"))
      .mockResolvedValueOnce({
        success: true,
        message: "ok",
        data: [],
        pagination: {
          pageNumber: 0,
          pageSize: 1,
          totalElements: 4,
          totalPages: 4,
          numberOfElements: 1,
        },
      });

    render(<TeacherHomeView />);

    expect(
      await screen.findByText(
        "No se pudo cargar el resumen de carga académica.",
      ),
    ).toBeInTheDocument();
    expect(await screen.findByText("3")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Ir a mis constancias" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));

    expect(await screen.findByText("4")).toBeInTheDocument();
    expect(mockedGetCourses).toHaveBeenCalledTimes(2);
  });
});
