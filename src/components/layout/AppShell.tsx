"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  const closeMenu = useCallback((restoreFocus = true) => {
    setIsMenuOpen(false);
    if (restoreFocus) {
      menuButtonRef.current?.focus();
    }
  }, []);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeMenu();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusable = drawerRef.current?.querySelectorAll<HTMLElement>(
        "button:not([disabled]), a[href]",
      );
      if (!focusable?.length) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    const desktopQuery = window.matchMedia?.("(min-width: 48rem)");
    const handleDesktop = () => {
      if (desktopQuery?.matches) {
        closeMenu(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    desktopQuery?.addEventListener("change", handleDesktop);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      desktopQuery?.removeEventListener("change", handleDesktop);
    };
  }, [closeMenu, isMenuOpen]);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)] md:grid md:grid-cols-[16rem_1fr]">
      {isMenuOpen ? (
        <button
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => closeMenu()}
          tabIndex={-1}
          type="button"
        />
      ) : null}
      <div
        aria-label={isMenuOpen ? "Menú de navegación" : undefined}
        aria-modal={isMenuOpen ? true : undefined}
        className={`${isMenuOpen ? "fixed" : "hidden"} inset-y-0 left-0 z-50 h-dvh w-64 max-w-[calc(100vw-3rem)] overflow-y-auto md:sticky md:top-0 md:z-auto md:block md:h-auto md:max-w-none md:self-start md:overflow-visible`}
        id="app-navigation"
        ref={drawerRef}
        role={isMenuOpen ? "dialog" : undefined}
      >
        <button
          aria-label="Cerrar menú de navegación"
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-md border border-[var(--border)] bg-[var(--surface)] text-xl text-[var(--text)] md:hidden"
          onClick={() => closeMenu()}
          ref={closeButtonRef}
          type="button"
        >
          &times;
        </button>
        <AppSidebar onNavigate={() => closeMenu(false)} />
      </div>
      <div className="min-w-0">
        <AppHeader
          breadcrumb={breadcrumb}
          title={title}
          subtitle={subtitle}
          badges={badges}
          isMenuOpen={isMenuOpen}
          menuButtonRef={menuButtonRef}
          onOpenMenu={() => setIsMenuOpen(true)}
        />
        <main className="space-y-5 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
