"use client";

import type { ReactNode } from "react";

import { RequireRole } from "@/components/auth/RequireRole";

type PerfilDocenteAccessGuardProps = {
  children: ReactNode;
};

export function PerfilDocenteAccessGuard({ children }: PerfilDocenteAccessGuardProps) {
  return <RequireRole allowedRoles={["DOCENTE", "ADMIN"]}>{children}</RequireRole>;
}
