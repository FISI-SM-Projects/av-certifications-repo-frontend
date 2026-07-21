export type UiMode = "demo" | "production";

export const UI_MODE_VALUES = ["demo", "production"] as const;

export function parseUiMode(value: string | null | undefined): UiMode {
  const normalizedValue = value?.trim().toLowerCase();

  return isUiMode(normalizedValue) ? normalizedValue : "demo";
}

export function getUiMode(): UiMode {
  return parseUiMode(process.env.NEXT_PUBLIC_UI_MODE);
}

export function isDemoMode(): boolean {
  return getUiMode() === "demo";
}

export function isProductionMode(): boolean {
  return getUiMode() === "production";
}

function isUiMode(value: string | undefined): value is UiMode {
  return UI_MODE_VALUES.includes(value as UiMode);
}
