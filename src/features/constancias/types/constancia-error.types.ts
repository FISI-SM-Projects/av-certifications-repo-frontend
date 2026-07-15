export type ConstanciaApiErrorBody = {
  message?: string;
  missingFields?: string[];
  missingCourses?: MissingCourse[];
};

export type MissingCourse = {
  code: string;
  section: string;
};

export class ConstanciaApiError extends Error {
  status: number;
  missingFields: string[];
  missingCourses: MissingCourse[];

  constructor(
    message: string,
    status: number,
    missingFields?: string[],
    missingCourses?: MissingCourse[],
  ) {
    super(message);
    this.name = "ConstanciaApiError";
    this.status = status;
    this.missingFields = missingFields ?? [];
    this.missingCourses = missingCourses ?? [];
  }
}
