import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// jsdom does not implement window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// On Node 22.13+/26 a native (experimental) localStorage shadows jsdom's and is
// unavailable without --localstorage-file, breaking tests that use it. Install a
// simple in-memory localStorage/sessionStorage so tests run deterministically.
function createMemoryStorage(): Storage {
  let store: Record<string, string> = {};
  return {
    get length() {
      return Object.keys(store).length;
    },
    clear() {
      store = {};
    },
    getItem(key: string) {
      return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null;
    },
    key(index: number) {
      return Object.keys(store)[index] ?? null;
    },
    removeItem(key: string) {
      delete store[key];
    },
    setItem(key: string, value: string) {
      store[key] = String(value);
    },
  } as Storage;
}

for (const name of ["localStorage", "sessionStorage"] as const) {
  Object.defineProperty(window, name, {
    configurable: true,
    writable: true,
    value: createMemoryStorage(),
  });
  Object.defineProperty(globalThis, name, {
    configurable: true,
    writable: true,
    value: (window as unknown as Record<string, unknown>)[name],
  });
}

afterEach(() => {
  cleanup();
});
