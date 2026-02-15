"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.persistAuthState = exports.restoreAuthState = void 0;
var promises_1 = require("fs/promises");
var path_1 = require("path");
var os_1 = require("os");
var env_1 = require("./env");
var getAuthStatePath = function () {
    var _a;
    var configDir = (_a = process.env.XDG_CONFIG_HOME) !== null && _a !== void 0 ? _a : (0, path_1.join)((0, os_1.homedir)(), ".config");
    return (0, path_1.join)(configDir, "cdp-core-examples", "auth-state.json");
};
/**
 * Restores localStorage from persisted file. Call before initialize() when running in Node.js.
 * No-op in browser or when no persisted state exists.
 */
var restoreAuthState = function () { return __awaiter(void 0, void 0, void 0, function () {
    var path, data, state, _i, _a, _b, key, value, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                if (!env_1.isNode || typeof globalThis.localStorage === "undefined") {
                    return [2 /*return*/];
                }
                path = getAuthStatePath();
                _d.label = 1;
            case 1:
                _d.trys.push([1, 3, , 4]);
                return [4 /*yield*/, (0, promises_1.readFile)(path, "utf-8")];
            case 2:
                data = _d.sent();
                state = JSON.parse(data);
                for (_i = 0, _a = Object.entries(state); _i < _a.length; _i++) {
                    _b = _a[_i], key = _b[0], value = _b[1];
                    globalThis.localStorage.setItem(key, value);
                }
                return [3 /*break*/, 4];
            case 3:
                _c = _d.sent();
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.restoreAuthState = restoreAuthState;
var waitForLocalStorage = function () { return __awaiter(void 0, void 0, void 0, function () {
    var intervalMs, maxWaitMs, maxAttempts, i;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                intervalMs = 100;
                maxWaitMs = 5000;
                maxAttempts = maxWaitMs / intervalMs;
                i = 0;
                _a.label = 1;
            case 1:
                if (!(i < maxAttempts)) return [3 /*break*/, 4];
                return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, intervalMs); })];
            case 2:
                _a.sent();
                if (globalThis.localStorage.length > 0) {
                    return [2 /*return*/];
                }
                _a.label = 3;
            case 3:
                i++;
                return [3 /*break*/, 1];
            case 4: return [2 /*return*/];
        }
    });
}); };
/**
 * Persists localStorage to file. Call after successful auth (e.g. verifyEmailOTP).
 * Waits until localStorage has content before persisting (SDK may write async).
 * No-op in browser.
 */
var persistAuthState = function () { return __awaiter(void 0, void 0, void 0, function () {
    var path, state, i, key, value, dir;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!env_1.isNode || typeof globalThis.localStorage === "undefined") {
                    return [2 /*return*/];
                }
                return [4 /*yield*/, waitForLocalStorage()];
            case 1:
                _a.sent();
                path = getAuthStatePath();
                state = {};
                for (i = 0; i < globalThis.localStorage.length; i++) {
                    key = globalThis.localStorage.key(i);
                    if (key) {
                        value = globalThis.localStorage.getItem(key);
                        if (value !== null) {
                            state[key] = value;
                        }
                    }
                }
                dir = (0, path_1.dirname)(path);
                return [4 /*yield*/, (0, promises_1.mkdir)(dir, { recursive: true })];
            case 2:
                _a.sent();
                return [4 /*yield*/, (0, promises_1.writeFile)(path, JSON.stringify(state), { mode: 384 })];
            case 3:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.persistAuthState = persistAuthState;
