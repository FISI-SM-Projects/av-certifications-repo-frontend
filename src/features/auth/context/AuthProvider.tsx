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

import type { UsuarioSesion } from "@/features/auth/types/auth.types";
import {
  eliminarSesion,
  guardarSesion,
  obtenerSesion,
} from "@/features/auth/storage/sessionStorage";

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

    queueMicrotask(() => {
      if (!isMounted) {
        return;
      }

      setUser(obtenerSesion());
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
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
