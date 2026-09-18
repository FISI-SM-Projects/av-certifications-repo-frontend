"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";

import { getAuthenticatedTeacher, login as backendLogin } from "@/services/auth/authService";
import {
  eliminarSesion,
  getToken,
  guardarSesion,
  obtenerSesion,
  removeToken,
  saveToken,
} from "@/services/auth/sessionStorage";
import type { AuthenticatedSession, LoginRequest, Role, UsuarioSesion } from "@/types/auth/auth.types";
import type { TeacherProfile } from "@/types/docente/teacherProfile.types";

type BackendSession = AuthenticatedSession & {
  teacher: TeacherProfile;
  roles: Role[];
};

type AuthContextValue = {
  user: UsuarioSesion | null;
  token: string | null;
  teacher: TeacherProfile | null;
  roles: Role[];
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (usuario: UsuarioSesion) => void;
  loginWithCredentials: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UsuarioSesion | null>(null);
  const [backendSession, setBackendSession] = useState<BackendSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const restorationRef = useRef<Promise<BackendSession> | null>(null);
  const sessionVersion = useRef(0);

  useEffect(() => {
    let isMounted = true;
    const version = sessionVersion.current;
    const storedToken = getToken();

    if (storedToken !== null) {
      const restoration = restorationRef.current ?? (async () => {
        const response = await getAuthenticatedTeacher();
        return {
          token: storedToken,
          tokenType: "Bearer" as const,
          teacher: response.data,
          roles: readRoles(storedToken),
        };
      })();
      restorationRef.current = restoration;

      void restoration.then(
        (session) => {
          if (isMounted && sessionVersion.current === version) {
            eliminarSesion();
            setBackendSession(session);
            setUser(null);
          }
        },
        () => {
          if (isMounted && sessionVersion.current === version) {
            removeToken();
            eliminarSesion();
            setBackendSession(null);
            setUser(null);
          }
        },
      ).finally(() => {
        if (isMounted && sessionVersion.current === version) {
          setIsLoading(false);
        }
      });

      return () => {
        isMounted = false;
      };
    }

    queueMicrotask(() => {
      if (!isMounted || sessionVersion.current !== version) {
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
    sessionVersion.current += 1;
    restorationRef.current = null;
    removeToken();
    setBackendSession(null);
    guardarSesion(usuario);
    setUser(usuario);
    setIsLoading(false);
  }, []);

  const loginWithCredentials = useCallback(async (credentials: LoginRequest) => {
    const version = ++sessionVersion.current;
    restorationRef.current = null;
    removeToken();
    eliminarSesion();
    setBackendSession(null);
    setUser(null);
    setIsLoading(false);

    try {
      const response = await backendLogin(credentials);
      const newToken = response.data.token;
      if (sessionVersion.current !== version) {
        return;
      }

      saveToken(newToken);
      const teacherResponse = await getAuthenticatedTeacher();
      const roles = readRoles(newToken);
      if (sessionVersion.current === version) {
        setBackendSession({
          token: newToken,
          tokenType: response.data.type,
          teacher: teacherResponse.data,
          roles,
        });
      }
    } catch (error) {
      if (sessionVersion.current === version) {
        removeToken();
        setBackendSession(null);
      }
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    sessionVersion.current += 1;
    restorationRef.current = null;
    removeToken();
    eliminarSesion();
    setBackendSession(null);
    setUser(null);
    setIsLoading(false);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token: backendSession?.token ?? null,
      teacher: backendSession?.teacher ?? null,
      roles: backendSession?.roles ?? [],
      isLoading,
      isAuthenticated: backendSession !== null || user !== null,
      login,
      loginWithCredentials,
      logout,
    }),
    [user, backendSession, isLoading, login, loginWithCredentials, logout],
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

function readRoles(token: string): Role[] {
  const encodedPayload = token.split(".")[1];
  if (!encodedPayload) {
    throw new Error("El JWT no contiene roles validos.");
  }

  let payload: unknown;
  try {
    const base64 = encodedPayload.replace(/-/g, "+").replace(/_/g, "/");
    payload = JSON.parse(atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="))) as unknown;
  } catch {
    throw new Error("El JWT no contiene roles validos.");
  }

  if (
    typeof payload !== "object" ||
    payload === null ||
    !("roles" in payload) ||
    !Array.isArray(payload.roles) ||
    payload.roles.length === 0
  ) {
    throw new Error("El JWT no contiene roles validos.");
  }

  const roles = payload.roles.map((authority: unknown): Role => {
    switch (authority) {
      case "ROLE_ADMIN": return "ADMIN";
      case "ROLE_DOCENTE": return "DOCENTE";
      case "ROLE_DIRECTOR_ESCUELA": return "DIRECTOR_ESCUELA";
      default: throw new Error("El JWT contiene un rol no reconocido.");
    }
  });

  return [...new Set(roles)];
}
