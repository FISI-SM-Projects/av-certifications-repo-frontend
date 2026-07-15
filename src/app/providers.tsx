"use client";

import type { ReactNode } from "react";

import { AuthProvider } from "@/features/auth/context/AuthProvider";

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return <AuthProvider>{children}</AuthProvider>;
}
