import { describe, expect, it } from "vitest";

import { isDemoAccessEnabled } from "@/lib/uiMode";

describe("isDemoAccessEnabled", () => {
  it("habilita el acceso con opt-in demo explicito en development", () => {
    expect(isDemoAccessEnabled("development", "demo")).toBe(true);
  });

  it("lo deshabilita cuando el modo de UI no es demo", () => {
    expect(isDemoAccessEnabled("development", "production")).toBe(false);
  });

  it("lo deshabilita cuando la variable de modo no existe", () => {
    expect(isDemoAccessEnabled("development", undefined)).toBe(false);
  });

  it("lo deshabilita en production aunque el modo indique demo", () => {
    expect(isDemoAccessEnabled("production", "demo")).toBe(false);
  });
});
