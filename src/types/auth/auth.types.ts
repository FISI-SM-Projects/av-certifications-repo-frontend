export type RolUsuario = "DOCENTE" | "DIRECTOR" | "ADMIN";

export type UsuarioSesion = {
  id: number;
  fullName: string;
  email: string;
  role: RolUsuario;
  departamentoAcademico: string | null;
  teacherCode: string | null;
};

export type DemoLoginRequest = {
  email: string;
};

export type DemoLoginResponse = {
  user: UsuarioSesion;
};

export type LoginRequest = {
  username: string;
  password: string;
};

export type LoginData = {
  type: "Bearer";
  token: string;
};

export type LoginResponse = {
  success: true;
  message: string;
  data: LoginData;
};

export type Role = "ADMIN" | "DOCENTE" | "DIRECTOR_ESCUELA";

// Teacher identity comes from /teachers/me; roles come from the JWT.
export type AuthenticatedSession = {
  token: string;
  tokenType: LoginData["type"];
};
