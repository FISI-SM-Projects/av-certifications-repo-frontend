"use client";

import type { ReactNode } from "react";

import { isDemoMode } from "@/lib/uiMode";

type DemoOnlyProps = {
  children: ReactNode;
};

export function DemoOnly({ children }: DemoOnlyProps) {
  if (!isDemoMode()) {
    return null;
  }

  return <>{children}</>;
}
