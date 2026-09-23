import { beforeEach, describe, expect, it, vi } from "vitest";

import { saveToken } from "@/services/auth/sessionStorage";
import { getAllAuthenticatedTeacherCourses } from "@/services/docente/academicWorkloadService";
import type { AcademicWorkload } from "@/types/docente/academicWorkload.types";

const fetchMock = vi.fn<typeof fetch>();

describe("getAllAuthenticatedTeacherCourses", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    saveToken("test-token");
  });

  it("recupera todas las páginas en orden y elimina repeticiones solo por id", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(pageResponse(
        [workload(1, 1), workload(2, 2)],
        0,
        2,
        3,
      )))
      .mockResolvedValueOnce(jsonResponse(pageResponse(
        [workload(2, 2), workload(3, 3, "COURSE2")],
        1,
        2,
        3,
      )));

    const result = await getAllAuthenticatedTeacherCourses();

    expect(result.map((item) => item.id)).toEqual([1, 2, 3]);
    expect(
      result
        .filter((item) => item.course.code === "COURSE2")
        .map((item) => item.section),
    ).toEqual([2, 3]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls.map(([url]) => String(url))).toEqual([
      "http://localhost:8080/api/v1/teachers/me/courses?page=0&size=10",
      "http://localhost:8080/api/v1/teachers/me/courses?page=1&size=10",
    ]);
    expect(fetchMock.mock.calls.map(([url]) => String(url)).join(" ")).not.toMatch(
      /teacherCode|teacherId|personId/,
    );
    expect(new Headers(fetchMock.mock.calls[0][1]?.headers).get("Authorization")).toBe(
      "Bearer test-token",
    );
  });
});

function workload(
  id: number,
  section: number,
  courseCode = `COURSE${id}`,
): AcademicWorkload {
  return {
    id,
    moodleId: 1000 + id,
    teacherId: 20,
    cycle: 8,
    section,
    plan: 2018,
    school: "SW",
    course: {
      id: 2000 + id,
      code: courseCode,
      name: `Curso ${id}`,
    },
    academicPeriod: {
      id: 30,
      semesterCode: "26.1",
      startDate: "2026-04-01",
      endDate: "2026-08-01",
    },
  };
}

function pageResponse(
  data: AcademicWorkload[],
  pageNumber: number,
  totalPages: number,
  totalElements: number,
) {
  return {
    success: true,
    message: "ok",
    data,
    pagination: {
      pageNumber,
      pageSize: 10,
      totalElements,
      totalPages,
      numberOfElements: data.length,
    },
  };
}

function jsonResponse(payload: unknown): Response {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
