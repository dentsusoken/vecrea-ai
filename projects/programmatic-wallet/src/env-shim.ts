/**
 * Emulates browser globals in Node.js (CLI) when they are not available.
 * No-op in browser where window and localStorage exist.
 */
if (typeof globalThis.window === "undefined") {
  const { webcrypto } = await import("crypto");
  const location = { href: "http://localhost:3000/", search: "" };
  const history = {
    state: null,
    replaceState: (_state: unknown, _title: string, url?: string) => {
      if (url) location.href = url;
    },
  };
  (globalThis as unknown as {
    window: {
      crypto: Crypto;
      location: { href: string; search: string };
      history: { state: null; replaceState: (a: unknown, b: string, c?: string) => void };
    };
  }).window = {
    crypto: webcrypto as Crypto,
    location,
    history,
  };
}

if (typeof globalThis.localStorage === "undefined") {
  const { createRequire } = await import("module");
  const require = createRequire(import.meta.url);
  require("localstorage-polyfill");
}

if (
  typeof process !== "undefined" &&
  typeof process.versions?.node === "string" &&
  typeof globalThis.localStorage !== "undefined"
) {
  const { restoreAuthState } = await import("./helper/auth-persistence");
  await restoreAuthState();
}

export {};
