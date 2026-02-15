"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Emulates browser globals in Node.js (CLI) when they are not available.
 * No-op in browser where window and localStorage exist.
 */
if (typeof globalThis.window === "undefined") {
    var webcrypto = (await Promise.resolve().then(function () { return require("crypto"); })).webcrypto;
    globalThis.window = {
        crypto: webcrypto,
    };
}
if (typeof globalThis.localStorage === "undefined") {
    var createRequire = (await Promise.resolve().then(function () { return require("module"); })).createRequire;
    var require_1 = createRequire(import.meta.url);
    require_1("localstorage-polyfill");
}
