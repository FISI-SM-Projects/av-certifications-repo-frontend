export type TipoConstancia = "CURSO" | "SEMESTRAL";

export type EstadoConstancia = "GENERADO" | "APROBADO";

export type TeacherPayload = {
  full_name: string;
  email: string;
  teacher_code: string;
};

export type CoursePayload = {
  code: string;
  subject: string;
  cycle: string;
  section: string;
  school: string;
  plan: string;
  semester: string;
};

export type IssuerPayload = {
  system: string;
  executed_by_userid: string;
  executed_by_email: string;
};

export type CourseCertificateRequest = {
  teacher: TeacherPayload;
  course: CoursePayload;
  issuer: IssuerPayload;
};

export type ExpectedCourseRequest = {
  code: string;
  section: string;
};

export type SemesterCertificateRequest = {
  teacher_code: string;
  semester: string;
  expected_courses: ExpectedCourseRequest[];
};

export type CourseCertificateResponse = {
  generationId: string;
  certificateKey: string;
  version: number;
  type: TipoConstancia;
  status: EstadoConstancia;
  teacherFullName: string;
  courseCode: string;
  courseSubject: string;
  section: string;
  semester: string;
  generatedAt: string;
  viewUrl: string;
  downloadUrl: string;
};

export type SemesterCertificateResponse = {
  generationId: string;
  certificateKey: string;
  version: number;
  type: "SEMESTRAL";
  status: EstadoConstancia;
  teacherCode: string;
  teacherFullName: string;
  semester: string;
  courseCount: number;
  sourceGenerationIds: string[];
  generatedAt: string;
  viewUrl: string;
  downloadUrl: string;
};

export type CertificateGenerationSummary = {
  generationId: string;
  certificateKey: string;
  version: number;
  type: TipoConstancia;
  status: EstadoConstancia;
  teacherCode: string;
  courseCode: string | null;
  section: string | null;
  semester: string;
  generatedAt: string;
  viewUrl: string;
  downloadUrl: string;
};

export type CertificateGenerationDetail = CertificateGenerationSummary;

export type CertificateHistoryItem = CertificateGenerationSummary;
