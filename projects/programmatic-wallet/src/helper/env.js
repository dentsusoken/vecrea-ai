"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNode = void 0;
exports.isNode = typeof process !== "undefined" && typeof ((_a = process.versions) === null || _a === void 0 ? void 0 : _a.node) === "string";
