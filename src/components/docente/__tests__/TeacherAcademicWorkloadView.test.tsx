import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AcademicWorkloadResponse } from "@/types/docente/academicWorkload.types";

const serviceMocks = vi.hoisted(() => ({
  getAuthenticatedTeacherCourses: vi.fn(),
}));

vi.mock("@/services/docente/academicWorkloadService", () => ({
  getAuthenticatedTeacherCourses: serviceMocks.getAuthenticatedTeacherCourses,
}));

import { TeacherAcademicWorkloadView } from "@/components/docente/TeacherAcademicWorkloadView";

describe("TeacherAcademicWorkloadView", () => {
  beforeEach(() => {
    serviceMocks.getAuthenticatedTeacherCourses.mockReset();
  });

  it("muestra los datos prioritarios y secundarios con la paginación deshabilitada", async () => {
    serviceMocks.getAuthenticatedTeacherCourses.mockResolvedValue(workloadResponse());

    render(<TeacherAcademicWorkloadView />);

    const card = await screen.findByRole("article", { name: "Ingeniería de Software" });
    expect(within(card).getByText("SW101")).toBeInTheDocument();
    expect(within(card).getByText("Ingeniería de Software")).toBeInTheDocument();
    expect(within(card).getByText("2026-1")).toBeInTheDocument();
    expect(within(card).getByText("1")).toBeInTheDocument();
    expect(within(card).getByText("8")).toBeInTheDocument();
    expect(within(card).getByText("2018")).toBeInTheDocument();
    expect(within(card).getByText("SW")).toBeInTheDocument();
    expect(screen.getByText("Página 1 de 1")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Anterior" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Siguiente" })).toBeDisabled();
  });

  it("solicita la siguiente página al backend cuando está disponible", async () => {
    serviceMocks.getAuthenticatedTeacherCourses
      .mockResolvedValueOnce(workloadResponse({ pageNumber: 0, totalPages: 2 }))
      .mockResolvedValueOnce(workloadResponse({ pageNumber: 1, totalPages: 2 }));

    render(<TeacherAcademicWorkloadView />);

    const nextButton = await screen.findByRole("button", { name: "Siguiente" });
    expect(nextButton).toBeEnabled();
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(serviceMocks.getAuthenticatedTeacherCourses).toHaveBeenLastCalledWith(
        { page: 1, size: 10 },
        expect.any(AbortSignal),
      );
    });
    expect(await screen.findByText("Página 2 de 2")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Siguiente" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Anterior" })).toBeEnabled();
  });
});

function workloadResponse(
  pagination: { pageNumber: number; totalPages: number } = { pageNumber: 0, totalPages: 1 },
): AcademicWorkloadResponse {
  return {
    success: true,
    message: "ok",
    data: [{
      id: 1,
      moodleId: 101,
      teacherId: 201,
      cycle: 8,
      section: 1,
      plan: 2018,
      school: "SW",
      course: { id: 301, code: "SW101", name: "Ingeniería de Software" },
      academicPeriod: {
        id: 401,
        semesterCode: "2026-1",
        startDate: "2026-03-01",
        endDate: "2026-07-31",
      },
    }],
    pagination: {
      pageNumber: pagination.pageNumber,
      pageSize: 10,
      totalElements: 11,
      totalPages: pagination.totalPages,
      numberOfElements: 1,
    },
  };
}
