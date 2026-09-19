import { beforeEach, describe, expect, it, vi } from "vitest";

import { getAuthenticatedTeacher, login } from "@/services/auth/authService";

const validLoginResponse = {
  success: true,
  message: "Inicio de sesion correcto",
  data: {
    type: "Bearer",
    token: "header.payload.signature",
  },
};

const validTeacherResponse = {
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

const fetchMock = vi.fn<typeof fetch>();

describe("authService", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  it("envia las credenciales al endpoint de login y devuelve el Bearer", async () => {
    fetchMock.mockResolvedValue(jsonResponse(validLoginResponse));

    await expect(login({ username: "docente", password: "secret" })).resolves.toEqual(
      validLoginResponse,
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, request] = fetchMock.mock.calls[0];
    expect(url).toBe("http://localhost:8080/api/v1/auth/login");
    expect(request?.method).toBe("POST");
    expect(JSON.parse(String(request?.body))).toEqual({
      username: "docente",
      password: "secret",
    });
  });

  it("rechaza envelopes de login sin un Bearer utilizable", async () => {
    const invalidResponses = [
      { ...validLoginResponse, success: false },
      { ...validLoginResponse, data: { type: "Basic", token: "token" } },
      { ...validLoginResponse, data: { type: "Bearer", token: "  " } },
      { success: true, message: "Sin datos" },
    ];

    for (const payload of invalidResponses) {
      fetchMock.mockResolvedValueOnce(jsonResponse(payload));
      await expect(login({ username: "docente", password: "secret" })).rejects.toMatchObject({
        status: 0,
      });
    }
  });

  it("carga el docente autenticado sin enviar teacherCode", async () => {
    fetchMock.mockResolvedValue(jsonResponse(validTeacherResponse));

    await expect(getAuthenticatedTeacher()).resolves.toEqual(validTeacherResponse);

    const [url, request] = fetchMock.mock.calls[0];
    expect(url).toBe("http://localhost:8080/api/v1/teachers/me");
    expect(request?.method).toBeUndefined();
    expect(request?.body).toBeUndefined();
  });
});

function jsonResponse(payload: unknown): Response {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
