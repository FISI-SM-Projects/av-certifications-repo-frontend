import { beforeEach, describe, expect, it } from "vitest";

import { getToken, removeToken, saveToken } from "@/services/auth/sessionStorage";

const TOKEN_KEY = "gestion-docente-token";

describe("JWT session storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("guarda y recupera un token normalizado", () => {
    saveToken("  header.payload.signature  ");

    expect(window.localStorage.getItem(TOKEN_KEY)).toBe("header.payload.signature");
    expect(getToken()).toBe("header.payload.signature");
  });

  it("rechaza tokens vacios o literales invalidos", () => {
    for (const token of ["", "   ", "undefined", " null ", "NULL"]) {
      expect(() => saveToken(token)).toThrow("El token de autenticacion no es valido.");
      expect(window.localStorage.getItem(TOKEN_KEY)).toBeNull();
    }
  });

  it("devuelve null para valores persistidos invalidos", () => {
    for (const token of ["", "undefined", "null"]) {
      window.localStorage.setItem(TOKEN_KEY, token);
      expect(getToken()).toBeNull();
    }
  });

  it("elimina el token persistido", () => {
    saveToken("header.payload.signature");

    removeToken();

    expect(getToken()).toBeNull();
    expect(window.localStorage.getItem(TOKEN_KEY)).toBeNull();
  });
});
