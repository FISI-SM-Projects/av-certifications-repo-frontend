import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  descargarPdfConstancia,
  generarConstanciaCurso,
  listarConstanciasDocente,
  obtenerConstanciaPorGeneracion,
} from "@/services/constancia/constanciaService";
import { saveToken } from "@/services/auth/sessionStorage";

const fetchMock = vi.fn<typeof fetch>();

describe("constanciaService autenticado", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    saveToken("test-token");
  });

  it("lista constancias con el endpoint self-service y sin identidad en la URL", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ success: true, message: "ok", data: [] }));

    await listarConstanciasDocente();

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("http://localhost:8080/api/v1/teachers/me/constancias");
    expect(String(url)).not.toContain("teacherCode");
    expect(new Headers(init?.headers).get("Authorization")).toBe("Bearer test-token");
  });

  it("genera por curso sin enviar teacherCode, teacherId ni personId", async () => {
    fetchMock.mockResolvedValue(jsonResponse({
      success: true,
      message: "ok",
      data: courseCertificateResponse(),
    }));

    await generarConstanciaCurso({
      course: {
        code: "COURSE01",
        subject: "Curso de prueba",
        cycle: "7",
        section: "1",
        school: "SW",
        plan: "2023",
        semester: "2026-1",
      },
      source_system: "moodle",
    });

    const [url, init] = fetchMock.mock.calls[0];
    const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
    expect(url).toBe("http://localhost:8080/api/v1/teachers/me/constancias/curso");
    expect(body).toEqual({
      course: expect.any(Object),
      source_system: "moodle",
    });
    expect(JSON.stringify(body)).not.toMatch(/teacherCode|teacher_code|teacherId|personId/);
  });

  it("descarga el PDF self-service con Bearer", async () => {
    fetchMock.mockResolvedValue(new Response(new Uint8Array([37, 80, 68, 70]), {
      status: 200,
      headers: { "Content-Type": "application/pdf" },
    }));

    const blob = await descargarPdfConstancia("generation-1");

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(
      "http://localhost:8080/api/v1/teachers/me/constancias/generaciones/generation-1/download",
    );
    expect(new Headers(init?.headers).get("Authorization")).toBe("Bearer test-token");
    expect(blob.type).toBe("application/pdf");
  });

  it("conserva el contrato administrativo sin confundirlo con el envelope self-service", async () => {
    fetchMock.mockResolvedValue(jsonResponse(courseCertificateResponse()));

    const certificate = await obtenerConstanciaPorGeneracion("generation-1", "administrative");

    const [url] = fetchMock.mock.calls[0];
    expect(url).toBe("http://localhost:8080/api/v1/constancias/generaciones/generation-1");
    expect(certificate.generationId).toBe("generation-1");
  });
});

function courseCertificateResponse() {
  return {
    generationId: "generation-1",
    certificateKey: "certificate-1",
    version: 1,
    type: "CURSO",
    status: "GENERADO",
    teacherCode: "DEV001",
    teacherFullName: "Docente Prueba",
    courseCode: "COURSE01",
    courseSubject: "Curso de prueba",
    section: "1",
    semester: "2026-1",
    generatedAt: "2026-09-21T00:00:00Z",
    viewUrl: "/api/v1/teachers/me/constancias/generaciones/generation-1/pdf",
    downloadUrl: "/api/v1/teachers/me/constancias/generaciones/generation-1/download",
  };
}

function jsonResponse(payload: unknown): Response {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
