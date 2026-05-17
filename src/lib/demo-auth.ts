const STORAGE_KEY = "lens-demo-session";

export const DEMO_USER_ID = "NEXUS LA";
export const DEMO_PASSWORD = "DEVDAYS";

export function normalizeUserId(value: string): string {
  return value.trim().replace(/\s+/g, " ").toUpperCase();
}

export function validateCredentials(userId: string, password: string): boolean {
  return normalizeUserId(userId) === DEMO_USER_ID && password === DEMO_PASSWORD;
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(STORAGE_KEY) === "1";
}

export function setAuthenticated(userId: string): void {
  sessionStorage.setItem(STORAGE_KEY, "1");
  sessionStorage.setItem(`${STORAGE_KEY}:user`, normalizeUserId(userId));
}

export function getSessionUserId(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(`${STORAGE_KEY}:user`);
}

export function clearAuth(): void {
  sessionStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(`${STORAGE_KEY}:user`);
}
