import type { ReactNode } from "react";

import { AppHeader } from "@/components/layout/AppHeader";
import { AppSidebar } from "@/components/layout/AppSidebar";

type AppShellProps = {
  breadcrumb?: string;
  title: string;
  subtitle?: string;
  badges?: string[];
  children: ReactNode;
};

export function AppShell({
  breadcrumb,
  title,
  subtitle,
  badges,
  children,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)] md:grid md:grid-cols-[16rem_1fr]">
      <AppSidebar />
      <div className="min-w-0">
        <AppHeader
          breadcrumb={breadcrumb}
          title={title}
          subtitle={subtitle}
          badges={badges}
        />
        <main className="space-y-5 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
