export type TipoConstancia = "CURSO" | "SEMESTRAL";
export type CertificationType = "COURSE" | "SEMESTER";

export const CERTIFICATE_STATUSES = ["GENERADA", "FIRMADA", "GENERADO", "APROBADO", "EMITIDO", "VERIFICADO", "EN_REVISION", "NO_EMITIDO", "REVOCADO"] as const;
export type EstadoConstancia = typeof CERTIFICATE_STATUSES[number];
export function isCertificateStatus(value: unknown): value is EstadoConstancia {
  return typeof value === "string" && CERTIFICATE_STATUSES.includes(value as EstadoConstancia);
}

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
  confirmIncomplete?: boolean;
};

export type CourseCertificateResponse = {
  generationId: string;
  certificateKey: string;
  version: number;
  type: TipoConstancia;
  certificateType: CertificationType;
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
  certificateType: "SEMESTER";
  status: EstadoConstancia;
  teacherCode: string;
  teacherFullName: string;
  semester: string;
  generatedAt: string;
  viewUrl: string;
  downloadUrl: string;
};

export type CertificateGenerationSummary = {
  pdfAvailable?: boolean;
  courseSubject?: string;
  generationId: string;
  certificateKey: string;
  version: number;
  type: TipoConstancia;
  certificateType?: CertificationType;
  status: EstadoConstancia;
  teacherCode: string;
  courseCode: string | null;
  section: string | null;
  semester: string;
  generatedAt: string | null;
  viewUrl: string;
  downloadUrl: string;
};

export type CertificateGenerationDetail = CertificateGenerationSummary;

export type CertificateHistoryItem = CertificateGenerationSummary;

export type CertificateApiResponse = {
  id: number;
  certificateKey: string;
  certificateType: CertificationType;
  status: EstadoConstancia;
  version: number;
  teacherId: number;
  teacherCode: string;
  teacherFullName: string;
  academicPeriodId: number;
  semester: string;
  academicWorkloadId: number | null;
  course: { id: number; code: string; name: string } | null;
  section: number | null;
  cycle: number | null;
  school: string | null;
  plan: number | null;
  generatedAt: string | null;
  signedAt: string | null;
  pdfAvailable: boolean;
  documentUrl: string;
};

export type CreateCertificateApiRequest =
  | {
      certificateType: "COURSE";
      academicWorkloadId: number;
    }
  | {
      certificateType: "SEMESTER";
      teacherCode: string;
      semester: string;
      confirmIncomplete?: boolean;
    };
