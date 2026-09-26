import { API_ROUTES } from "@/config/apiRoutes";
import { ApiError, httpJson, isRecord } from "@/lib/api/httpClient";
import type {
  AcademicPeriodSummary,
  AcademicWorkload,
  AcademicWorkloadQuery,
  AcademicWorkloadResponse,
  CourseSummary,
  School,
} from "@/types/docente/academicWorkload.types";

const SCHOOLS: School[] = ["EG", "SI", "SW", "CC", "IA"];
const ACADEMIC_WORKLOAD_PAGE_SIZE = 10;

export async function getAuthenticatedTeacherCourses(
  query: AcademicWorkloadQuery,
  signal?: AbortSignal,
): Promise<AcademicWorkloadResponse> {
  const searchParams = new URLSearchParams({
    page: String(query.page),
    size: String(query.size),
  });

  appendNumber(searchParams, "cycle", query.cycle);
  appendNumber(searchParams, "plan", query.plan);
  appendText(searchParams, "semester", query.semester);
  appendText(searchParams, "course", query.course);
  query.sort?.forEach((sort) => appendText(searchParams, "sort", sort));

  return httpJson<AcademicWorkloadResponse>(
    `${API_ROUTES.teachers.courses}?${searchParams.toString()}`,
    {
      signal,
      validate: validateAcademicWorkloadResponse,
    },
  );
}

export async function getAllAuthenticatedTeacherCourses(
  signal?: AbortSignal,
): Promise<AcademicWorkload[]> {
  const workloadsById = new Map<number, AcademicWorkload>();
  let page = 0;
  let totalPages = 1;

  while (page < totalPages) {
    const response = await getAuthenticatedTeacherCourses(
      { page, size: ACADEMIC_WORKLOAD_PAGE_SIZE },
      signal,
    );

    response.data.forEach((workload) => {
      if (!workloadsById.has(workload.id)) {
        workloadsById.set(workload.id, workload);
      }
    });

    totalPages = response.pagination.totalPages;
    page += 1;
  }

  return Array.from(workloadsById.values());
}

function appendNumber(params: URLSearchParams, name: string, value?: number): void {
  if (value !== undefined) {
    params.set(name, String(value));
  }
}

function appendText(params: URLSearchParams, name: string, value?: string): void {
  const normalizedValue = value?.trim();
  if (normalizedValue) {
    params.append(name, normalizedValue);
  }
}

function validateAcademicWorkloadResponse(payload: unknown): AcademicWorkloadResponse {
  if (
    !isRecord(payload) ||
    payload.success !== true ||
    typeof payload.message !== "string" ||
    !Array.isArray(payload.data) ||
    !payload.data.every(isAcademicWorkload) ||
    !isPagination(payload.pagination)
  ) {
    throw new ApiError("La respuesta de carga academica no tiene el formato esperado.", 0);
  }

  return payload as AcademicWorkloadResponse;
}

function isAcademicWorkload(value: unknown): value is AcademicWorkload {
  return (
    isRecord(value) &&
    isNumber(value.id) &&
    isNumber(value.moodleId) &&
    isNumber(value.teacherId) &&
    isNumber(value.cycle) &&
    isNumber(value.section) &&
    isNumber(value.plan) &&
    isSchool(value.school) &&
    isCourse(value.course) &&
    isAcademicPeriod(value.academicPeriod)
  );
}

function isCourse(value: unknown): value is CourseSummary {
  return (
    isRecord(value) &&
    isNumber(value.id) &&
    typeof value.code === "string" &&
    typeof value.name === "string"
  );
}

function isAcademicPeriod(value: unknown): value is AcademicPeriodSummary {
  return (
    isRecord(value) &&
    isNumber(value.id) &&
    typeof value.semesterCode === "string" &&
    typeof value.startDate === "string" &&
    typeof value.endDate === "string"
  );
}

function isPagination(value: unknown): boolean {
  return (
    isRecord(value) &&
    isNumber(value.pageNumber) &&
    isNumber(value.pageSize) &&
    isNumber(value.totalElements) &&
    isNumber(value.totalPages) &&
    isNumber(value.numberOfElements)
  );
}

function isSchool(value: unknown): value is School {
  return typeof value === "string" && SCHOOLS.includes(value as School);
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}
