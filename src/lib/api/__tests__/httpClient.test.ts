import { beforeEach, describe, expect, it, vi } from "vitest";

import { httpJson } from "@/lib/api/httpClient";
import { saveToken } from "@/services/auth/sessionStorage";

const fetchMock = vi.fn<typeof fetch>();

describe("httpClient Authorization", () => {
  beforeEach(() => {
    window.localStorage.clear();
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  it("adjunta Bearer cuando existe un token", async () => {
    saveToken("test-token");
    fetchMock.mockResolvedValue(jsonResponse({ ok: true }));

    await httpJson("/api/v1/protected");

    expect(lastRequestHeaders().get("Authorization")).toBe("Bearer test-token");
  });

  it("no agrega Authorization cuando no existe token", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ ok: true }));

    await httpJson("/api/v1/public");

    expect(lastRequestHeaders().has("Authorization")).toBe(false);
  });

  it("respeta Authorization explicito del caller", async () => {
    saveToken("stored-token");

    for (const headerName of ["Authorization", "authorization", "AUTHORIZATION"]) {
      fetchMock.mockResolvedValueOnce(jsonResponse({ ok: true }));
      await httpJson("/api/v1/protected", {
        headers: { [headerName]: "Basic explicit" },
      });
      expect(lastRequestHeaders().get("Authorization")).toBe("Basic explicit");
    }
  });
});

function lastRequestHeaders(): Headers {
  const lastCall = fetchMock.mock.calls.at(-1);
  return new Headers(lastCall?.[1]?.headers);
}

function jsonResponse(payload: unknown): Response {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
