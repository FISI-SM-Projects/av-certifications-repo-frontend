export type School = "EG" | "SI" | "SW" | "CC" | "IA";

export type CourseSummary = {
  id: number;
  code: string;
  name: string;
};

export type AcademicPeriodSummary = {
  id: number;
  semesterCode: string;
  startDate: string;
  endDate: string;
};

export type AcademicWorkload = {
  id: number;
  moodleId: number;
  teacherId: number;
  cycle: number;
  section: number;
  plan: number;
  school: School;
  course: CourseSummary;
  academicPeriod: AcademicPeriodSummary;
};

export type AcademicWorkloadPagination = {
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  numberOfElements: number;
};

export type AcademicWorkloadResponse = {
  success: true;
  message: string;
  data: AcademicWorkload[];
  pagination: AcademicWorkloadPagination;
};

export type AcademicWorkloadQuery = {
  page: number;
  size: number;
  cycle?: number;
  plan?: number;
  semester?: string;
  course?: string;
  sort?: string[];
};
