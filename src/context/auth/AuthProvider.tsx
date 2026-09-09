"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

import type { UsuarioSesion } from "@/types/auth/auth.types";
import { refreshRealSession } from "@/services/auth/authService";
import {
  AUTH_SESSION_CLEARED_EVENT,
  eliminarSesion,
  guardarSesion,
  obtenerSesion,
} from "@/services/auth/sessionStorage";

type AuthContextValue = {
  user: UsuarioSesion | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (usuario: UsuarioSesion) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UsuarioSesion | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    function handleSessionCleared() {
      setUser(null);
    }

    window.addEventListener(AUTH_SESSION_CLEARED_EVENT, handleSessionCleared);

    queueMicrotask(() => {
      if (!isMounted) {
        return;
      }

      const stored = obtenerSesion();
      if (stored?.authMode === "jwt") {
        void refreshRealSession(stored).then((current) => {
          if (isMounted) { guardarSesion(current); setUser(current); }
        }).catch(() => {
          if (isMounted) { eliminarSesion(); setUser(null); }
        }).finally(() => { if (isMounted) setIsLoading(false); });
      } else {
        if (stored) eliminarSesion();
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      window.removeEventListener(AUTH_SESSION_CLEARED_EVENT, handleSessionCleared);
    };
  }, []);

  const login = useCallback((usuario: UsuarioSesion) => {
    guardarSesion(usuario);
    setUser(usuario);
  }, []);

  const logout = useCallback(() => {
    eliminarSesion();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: user !== null,
      login,
      logout,
    }),
    [user, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (context === null) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }

  return context;
}
