import { ApiError, httpJson, isRecord } from "@/lib/api/httpClient";
import { API_ROUTES } from "@/config/apiRoutes";
import type { PerfilDocenteResponse } from "@/types/docente/perfilDocente.types";
import type { DirectorDocenteListado } from "@/types/director/director.types";
import type { PaginatedApiEnvelope, Pagination } from "@/types/api.types";
import { listarConstanciasDocente } from "@/services/constancia/constanciaService";

export async function obtenerDocentesPorDepartamento(
  departamentoAcademico: string,
): Promise<DirectorDocenteListado[]> {
  return fetchTeachers(departamentoAcademico.trim());
}

export async function obtenerPerfilDocentePorCodigo(
  teacherCode: string,
): Promise<PerfilDocenteResponse> {
  const codigo = teacherCode.trim();
  if (codigo === "") {
    throw new ApiError("El codigo docente es obligatorio.", 0);
  }

  const docente = (await fetchTeachers("")).find((teacher) => teacher.teacherCode === codigo);
  if (!docente) {
    throw new ApiError("No se encontro el docente solicitado.", 404);
  }

  const constancias = await listarConstanciasDocente(codigo);
  return {
    docente: {
      id: Number(docente.id),
      codigo: docente.teacherCode,
      nombres: docente.nombres,
      apellidos: docente.apellidos,
      correoInstitucional: docente.correoInstitucional,
      departamentoAcademico: docente.departamentoAcademico,
      categoria: docente.categoria,
      condicion: docente.condicion,
      estado: docente.estado,
    },
    constancias,
  };
}

async function fetchTeachers(department: string): Promise<DirectorDocenteListado[]> {
  const firstPage = await fetchTeachersPage(department, 0);
  const teachers = [...firstPage.data.map(mapTeacherToDirectorDocente)];

  for (let page = 1; page < firstPage.pagination.totalPages; page += 1) {
    const nextPage = await fetchTeachersPage(department, page);
    teachers.push(...nextPage.data.map(mapTeacherToDirectorDocente));
  }

  return teachers;
}

async function fetchTeachersPage(
  department: string,
  page: number,
): Promise<PaginatedApiEnvelope<TeacherApiData[]>> {
  const params = new URLSearchParams({
    page: String(page),
    size: "50",
  });
  if (department !== "") {
    params.set("department", department);
  }

  return httpJson<PaginatedApiEnvelope<TeacherApiData[]>>(
    `${API_ROUTES.TEACHERS}?${params.toString()}`,
    {
      validate: validateTeacherPage,
      defaultErrorMessage: "No se pudo cargar el listado de docentes.",
    },
  );
}

function validateTeacherPage(payload: unknown): PaginatedApiEnvelope<TeacherApiData[]> {
  if (!isRecord(payload) || payload.success !== true || !Array.isArray(payload.data)
    || !payload.data.every(isTeacherApiData) || !isPagination(payload.pagination)) {
    throw new ApiError("La lista de docentes no tiene el formato esperado.", 0);
  }

  return payload as PaginatedApiEnvelope<TeacherApiData[]>;
}

function isTeacherApiData(value: unknown): value is TeacherApiData {
  return isRecord(value)
    && Number.isSafeInteger(value.id)
    && Number.isSafeInteger(value.personId)
    && Number.isSafeInteger(value.moodleId)
    && typeof value.code === "string"
    && (value.dni === null || typeof value.dni === "string")
    && typeof value.email === "string"
    && typeof value.firstName === "string"
    && typeof value.paternalLastName === "string"
    && (value.maternalLastName === null || typeof value.maternalLastName === "string")
    && (value.department === null || typeof value.department === "string")
    && typeof value.registerState === "string";
}

function isPagination(value: unknown): value is Pagination {
  return isRecord(value)
    && Number.isSafeInteger(value.pageNumber)
    && Number.isSafeInteger(value.pageSize)
    && Number.isSafeInteger(value.totalElements)
    && Number.isSafeInteger(value.totalPages)
    && Number.isSafeInteger(value.numberOfElements);
}

function mapTeacherToDirectorDocente(teacher: TeacherApiData): DirectorDocenteListado {
  return {
    id: teacher.id,
    teacherCode: teacher.code,
    nombres: teacher.firstName,
    apellidos: `${teacher.paternalLastName}${teacher.maternalLastName ? ` ${teacher.maternalLastName}` : ""}`,
    correoInstitucional: teacher.email,
    departamentoAcademico: teacher.department ?? "",
    categoria: "No registrado",
    condicion: teacher.registerState,
    estado: teacher.registerState,
  };
}

type TeacherApiData = {
  id: number;
  personId: number;
  moodleId: number;
  code: string;
  dni: string | null;
  email: string;
  firstName: string;
  paternalLastName: string;
  maternalLastName: string | null;
  department: string | null;
  registerState: string;
};
