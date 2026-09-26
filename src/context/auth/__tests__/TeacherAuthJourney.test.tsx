import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getAuthenticatedTeacher: vi.fn(),
  getCourses: vi.fn(),
  listCertificates: vi.fn(),
  login: vi.fn(),
  pathname: "/perfil-docente",
  push: vi.fn(),
  replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => mocks.pathname,
  useRouter: () => ({ push: mocks.push, replace: mocks.replace }),
}));

vi.mock("@/services/auth/authService", () => ({
  getAuthenticatedTeacher: mocks.getAuthenticatedTeacher,
  login: mocks.login,
}));

vi.mock("@/services/docente/academicWorkloadService", () => ({
  getAuthenticatedTeacherCourses: mocks.getCourses,
}));

vi.mock("@/services/constancia/constanciaService", () => ({
  listarConstanciasDocente: mocks.listCertificates,
}));

import LoginPage from "@/app/login/page";
import { AppShell } from "@/components/layout/AppShell";
import { TeacherAcademicWorkloadView } from "@/components/docente/TeacherAcademicWorkloadView";
import { TeacherHomeView } from "@/components/docente/TeacherHomeView";
import { AuthProvider } from "@/context/auth/AuthProvider";
import { RequireRole } from "@/guards/auth/RequireRole";

const TOKEN_STORAGE_KEY = "gestion-docente-token";
const teacherResponse = {
  success: true,
  message: "Docente autenticado",
  data: {
    id: 1,
    personId: 10,
    moodleId: null,
    code: "DOC-001",
    dni: null,
    firstName: "Docente",
    paternalLastName: "Prueba",
    maternalLastName: null,
    department: "CC",
    registerState: "ACTIVO",
  },
};

describe("journey de autenticación DOCENTE", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.pathname = "/perfil-docente";
    mocks.getAuthenticatedTeacher.mockResolvedValue(teacherResponse);
    mocks.getCourses.mockResolvedValue(workloadResponse());
    mocks.listCertificates.mockResolvedValue([certificateSummary()]);
  });

  it("integra login, Inicio, restauración tras remontar y logout al acceso real", async () => {
    const token = createToken(["ROLE_DOCENTE"]);
    mocks.login.mockResolvedValue({
      success: true,
      message: "Inicio de sesión correcto",
      data: { type: "Bearer", token },
    });

    const loginTree = render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>,
    );

    fireEvent.change(screen.getByLabelText("Usuario"), {
      target: { value: "docente.fixture" },
    });
    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { value: "test-password" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Ingresar" }));

    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/perfil-docente"));
    expect(mocks.login).toHaveBeenCalledWith({
      username: "docente.fixture",
      password: "test-password",
    });
    expect(window.localStorage.getItem(TOKEN_STORAGE_KEY)).toBe(token);
    expect(mocks.getAuthenticatedTeacher).toHaveBeenCalledTimes(1);

    loginTree.unmount();

    renderProtected(
      <AppShell title="Inicio">
        <TeacherHomeView />
      </AppShell>,
    );

    expect(await screen.findByRole("heading", { name: "Tu actividad" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver carga académica" })).toHaveAttribute(
      "href",
      "/carga-academica",
    );
    expect(screen.getByRole("link", { name: "Ir a mis constancias" })).toHaveAttribute(
      "href",
      "/constancias",
    );
    await waitFor(() => {
      expect(screen.getByText("2")).toBeInTheDocument();
      expect(screen.getByText("1")).toBeInTheDocument();
    });
    expect(mocks.getAuthenticatedTeacher).toHaveBeenCalledTimes(2);

    const sidebar = screen.getByRole("complementary");
    expect(within(sidebar).getByText("Docente Prueba")).toBeInTheDocument();
    fireEvent.click(within(sidebar).getByRole("button", { name: "Cerrar sesión" }));

    expect(window.localStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull();
    expect(mocks.push).toHaveBeenCalledWith("/login");
    expect(mocks.push).not.toHaveBeenCalledWith("/login-demo");
    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/login"));
  });

  it("restaura el contexto antes de mostrar la carga académica protegida", async () => {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, createToken(["ROLE_DOCENTE"]));
    mocks.pathname = "/carga-academica";

    renderProtected(
      <AppShell title="Carga académica">
        <TeacherAcademicWorkloadView />
      </AppShell>,
    );

    expect(await screen.findAllByText("Arquitectura de Software")).toHaveLength(2);
    expect(screen.getAllByText("COURSE01")).toHaveLength(2);
    expect(mocks.getAuthenticatedTeacher).toHaveBeenCalledTimes(1);
    expect(mocks.getCourses).toHaveBeenCalledWith(
      { page: 0, size: 10 },
      expect.any(AbortSignal),
    );
    expect(mocks.replace).not.toHaveBeenCalledWith("/login");
  });

  it("limpia una restauración fallida y el guard vuelve a login", async () => {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, createToken(["ROLE_DOCENTE"]));
    mocks.getAuthenticatedTeacher.mockRejectedValue(new Error("Sesión expirada"));

    renderProtected(<p>Contenido docente protegido</p>);

    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/login"));
    expect(window.localStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull();
    expect(screen.queryByText("Contenido docente protegido")).not.toBeInTheDocument();
  });
});

function renderProtected(children: ReactNode) {
  return render(
    <AuthProvider>
      <RequireRole allowedRoles={["DOCENTE"]}>{children}</RequireRole>
    </AuthProvider>,
  );
}

function createToken(roles: string[]): string {
  const payload = btoa(JSON.stringify({ roles }))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return `header.${payload}.signature`;
}

function workloadResponse() {
  return {
    success: true as const,
    message: "ok",
    data: [
      {
        id: 11,
        moodleId: 1011,
        teacherId: 20,
        cycle: 8,
        section: 1,
        plan: 2018,
        school: "SW" as const,
        course: { id: 2011, code: "COURSE01", name: "Arquitectura de Software" },
        academicPeriod: {
          id: 31,
          semesterCode: "26.1",
          startDate: "2026-04-01",
          endDate: "2026-08-01",
        },
      },
    ],
    pagination: {
      pageNumber: 0,
      pageSize: 10,
      totalElements: 2,
      totalPages: 1,
      numberOfElements: 1,
    },
  };
}

function certificateSummary() {
  return {
    generationId: "GEN-01",
    certificateKey: "CERT-01",
    version: 1,
    type: "CURSO" as const,
    status: "GENERADO" as const,
    teacherCode: "DOC-001",
    courseCode: "COURSE01",
    section: "1",
    semester: "26.1",
    generatedAt: "2026-09-24T15:00:00Z",
    viewUrl: "/view",
    downloadUrl: "/download",
  };
}
