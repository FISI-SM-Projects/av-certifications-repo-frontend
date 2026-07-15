import type { UsuarioSesion } from "@/features/auth/types/auth.types";

export function obtenerTeacherCodeDeSesion(user: UsuarioSesion | null): string | null {
  if (!user?.teacherCode) {
    return null;
  }

  const teacherCode = user.teacherCode.trim();

  return teacherCode === "" ? null : teacherCode;
}
