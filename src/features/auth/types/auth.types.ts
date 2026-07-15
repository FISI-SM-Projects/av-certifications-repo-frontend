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
