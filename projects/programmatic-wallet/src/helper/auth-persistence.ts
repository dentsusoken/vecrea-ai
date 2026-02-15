import { mkdir, readFile, writeFile } from "fs/promises";
import { dirname, join } from "path";
import { homedir } from "os";
import { isNode } from "./env";

const getAuthStatePath = (): string => {
  const configDir =
    process.env.XDG_CONFIG_HOME ?? join(homedir(), ".config");
  return join(configDir, "cdp-core-examples", "auth-state.json");
};

/**
 * Restores localStorage from persisted file. Call before initialize() when running in Node.js.
 * No-op in browser or when no persisted state exists.
 */
export const restoreAuthState = async (): Promise<void> => {
  if (!isNode || typeof globalThis.localStorage === "undefined") {
    return;
  }
  const path = getAuthStatePath();
  try {
    const data = await readFile(path, "utf-8");
    const state = JSON.parse(data) as Record<string, string>;
    for (const [key, value] of Object.entries(state)) {
      globalThis.localStorage.setItem(key, value);
    }
  } catch {
    // File not found or invalid - ignore
  }
};

const waitForLocalStorage = async (): Promise<void> => {
  const intervalMs = 100;
  const maxWaitMs = 5000;
  const maxAttempts = maxWaitMs / intervalMs;
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, intervalMs));
    if (globalThis.localStorage.length > 0) {
      return;
    }
  }
};

/**
 * Persists localStorage to file. Call after successful auth or at end of command.
 * Waits until localStorage has content before persisting (SDK may write async).
 * Skips when localStorage is empty (avoids overwriting with empty state).
 * No-op in browser.
 */
export const persistAuthState = async (): Promise<void> => {
  if (!isNode || typeof globalThis.localStorage === "undefined") {
    return;
  }
  await waitForLocalStorage();
  if (globalThis.localStorage.length === 0) {
    return;
  }
  const path = getAuthStatePath();
  const state: Record<string, string> = {};
  for (let i = 0; i < globalThis.localStorage.length; i++) {
    const key = globalThis.localStorage.key(i);
    if (key) {
      const value = globalThis.localStorage.getItem(key);
      if (value !== null) {
        state[key] = value;
      }
    }
  }
  const dir = dirname(path);
  await mkdir(dir, { recursive: true });
  await writeFile(path, JSON.stringify(state), { mode: 0o600 });
};
