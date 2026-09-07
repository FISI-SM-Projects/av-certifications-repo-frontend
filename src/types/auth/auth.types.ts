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
