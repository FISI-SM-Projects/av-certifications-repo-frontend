export type RolUsuario = "DOCENTE" | "DIRECTOR" | "ADMIN";

export type AuthMode = "jwt";

export type UsuarioSesion = {
  id: number;
  fullName: string;
  email: string;
  role: RolUsuario;
  departamentoAcademico: string | null;
  teacherCode: string | null;
  authMode?: AuthMode;
  token?: string;
  tokenType?: string;
  subject?: string;
  personId?: number | null;
  accountId?: number | null;
  expiresAt?: number | null;
  roles?: string[];
  teacher?: { teacherId: number; teacherCode: string; moodleId: number; department: string | null } | null;
};

export type TeacherMe = {
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

export type RealLoginRequest = {
  username: string;
  password: string;
};

export type RealLoginResponse = {
  token: string;
  type: string;
};
