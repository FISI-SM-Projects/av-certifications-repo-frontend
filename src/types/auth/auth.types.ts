export type RolUsuario = "DOCENTE" | "DIRECTOR" | "ADMIN";

export type AuthMode = "demo" | "jwt";

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
  teacher?: InstitutionalContext["teacher"];
};

export type InstitutionalContext = {
  accountId: number;
  personId: number;
  ldapUid: string;
  institutionalEmail: string;
  fullName: string;
  roles: string[];
  accountStatus: string;
  personStatus: string;
  teacher: { teacherId: number; teacherCode: string; moodleId: number; department: string | null } | null;
  student: null;
  administrative: null;
};

export type DemoLoginRequest = {
  email: string;
};

export type DemoLoginResponse = {
  user: UsuarioSesion;
};

export type RealLoginRequest = {
  username: string;
  password: string;
};

export type RealLoginResponse = {
  token: string;
  type: string;
};
