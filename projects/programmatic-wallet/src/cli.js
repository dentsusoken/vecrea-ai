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
require("./env-shim");
require("dotenv/config");
var cdp_core_1 = require("@coinbase/cdp-core");
var balance_1 = require("./helper/balance");
var chain_1 = require("./helper/chain");
var auth_persistence_1 = require("./helper/auth-persistence");
var initializeWithNodeCompat_1 = require("./helper/initializeWithNodeCompat");
var prompt_1 = require("./helper/prompt");
var getConfig = function () {
    var _a;
    return ({
        projectId: (_a = process.env.CDP_PROJECT_ID) !== null && _a !== void 0 ? _a : "your-project-id",
        disableAnalytics: true,
        ethereum: {
            createOnLogin: "eoa",
        },
    });
};
var runAuthLogin = function (email) { return __awaiter(void 0, void 0, void 0, function () {
    var authResult;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, cdp_core_1.signInWithEmail)({ email: email })];
            case 1:
                authResult = _a.sent();
                console.log("✓ Verification code sent!");
                console.log("\u2139 Check your email (".concat(email, ") for a 6-digit code.\n"));
                console.log("Flow ID: ".concat(authResult.flowId, "\n"));
                console.log("To complete sign-in, run:");
                console.log("  npx tsx src/cli.ts auth verify ".concat(authResult.flowId, " <6-digit-code>"));
                return [2 /*return*/];
        }
    });
}); };
var runAuthVerify = function (flowId, otp) { return __awaiter(void 0, void 0, void 0, function () {
    var result, email;
    var _a, _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0: return [4 /*yield*/, (0, cdp_core_1.verifyEmailOTP)({ flowId: flowId, otp: otp })];
            case 1:
                result = _d.sent();
                return [4 /*yield*/, (0, auth_persistence_1.persistAuthState)()];
            case 2:
                _d.sent();
                email = (_c = (_b = (_a = result.user.authenticationMethods) === null || _a === void 0 ? void 0 : _a.email) === null || _b === void 0 ? void 0 : _b.email) !== null && _c !== void 0 ? _c : "unknown@email.com";
                console.log("✔ Authentication successful!");
                console.log("Successfully signed in as ".concat(email, ".\n"));
                console.log("You can now use wallet commands:");
                console.log("  npx tsx src/cli.ts balance");
                console.log("  npx tsx src/cli.ts address");
                return [2 /*return*/];
        }
    });
}); };
var parseBalanceArgs = function (input) {
    var parts = input.split(/\s+/);
    var chainIdx = parts.findIndex(function (p) { return p === "--chain"; });
    var chain = chainIdx >= 0 && parts[chainIdx + 1]
        ? parts[chainIdx + 1].toLowerCase()
        : "base";
    return { chain: chain };
};
var FAUCET_LINKS = {
    "base-sepolia": {
        eth: [
            "https://base.faucet.dev/BaseSepolia",
            "https://www.alchemy.com/faucets/base-sepolia",
            "https://faucet.quicknode.com/base/sepolia",
        ],
        usdc: ["https://portal.cdp.coinbase.com/products/faucet"],
    },
};
var main = function () { return __awaiter(void 0, void 0, void 0, function () {
    var args, email, signedIn_1, user, address, signedIn_2, user, email, flowId, otp, signedIn, email, authResult, otp, user, evmAddresses, address, chain, _a, eth, usdc, _loop_1, state_1;
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
    return __generator(this, function (_r) {
        switch (_r.label) {
            case 0:
                args = process.argv.slice(2);
                if (!(args[0] === "auth" && args[1] === "login")) return [3 /*break*/, 4];
                email = args[2];
                if (!email) {
                    console.error("Usage: auth login <email>");
                    process.exit(1);
                }
                console.log("Initializing CDP Core...");
                return [4 /*yield*/, (0, auth_persistence_1.restoreAuthState)()];
            case 1:
                _r.sent();
                return [4 /*yield*/, (0, initializeWithNodeCompat_1.initializeWithNodeCompat)(getConfig())];
            case 2:
                _r.sent();
                return [4 /*yield*/, runAuthLogin(email)];
            case 3:
                _r.sent();
                process.exit(0);
                _r.label = 4;
            case 4:
                if (!(args[0] === "address")) return [3 /*break*/, 9];
                return [4 /*yield*/, (0, auth_persistence_1.restoreAuthState)()];
            case 5:
                _r.sent();
                return [4 /*yield*/, (0, initializeWithNodeCompat_1.initializeWithNodeCompat)(getConfig())];
            case 6:
                _r.sent();
                return [4 /*yield*/, (0, cdp_core_1.isSignedIn)()];
            case 7:
                signedIn_1 = _r.sent();
                if (!signedIn_1) {
                    console.log("✖ Failed to fetch address");
                    console.log("Authentication required.\n");
                    console.log("Sign in using one of:");
                    console.log("  1. Email OTP:");
                    console.log("     npx tsx src/cli.ts auth login <your-email>");
                    console.log("     npx tsx src/cli.ts auth verify <flow-id> <6-digit-code>");
                    process.exit(1);
                }
                return [4 /*yield*/, (0, cdp_core_1.getCurrentUser)()];
            case 8:
                user = _r.sent();
                address = (_c = (_b = user === null || user === void 0 ? void 0 : user.evmAccountObjects) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.address;
                if (!address) {
                    console.log("✖ Failed to fetch address");
                    console.log("No EVM account found.\n");
                    console.log("Sign in using one of:");
                    console.log("  1. Email OTP:");
                    console.log("     npx tsx src/cli.ts auth login <your-email>");
                    console.log("     npx tsx src/cli.ts auth verify <flow-id> <6-digit-code>");
                    process.exit(1);
                }
                console.log(address);
                process.exit(0);
                _r.label = 9;
            case 9:
                if (!(args[0] === "status")) return [3 /*break*/, 16];
                console.log("Initializing CDP Core...");
                return [4 /*yield*/, (0, auth_persistence_1.restoreAuthState)()];
            case 10:
                _r.sent();
                return [4 /*yield*/, (0, initializeWithNodeCompat_1.initializeWithNodeCompat)(getConfig())];
            case 11:
                _r.sent();
                return [4 /*yield*/, (0, cdp_core_1.isSignedIn)()];
            case 12:
                signedIn_2 = _r.sent();
                console.log("\nAuthentication");
                if (!signedIn_2) return [3 /*break*/, 14];
                return [4 /*yield*/, (0, cdp_core_1.getCurrentUser)()];
            case 13:
                user = _r.sent();
                email = (_f = (_e = (_d = user === null || user === void 0 ? void 0 : user.authenticationMethods) === null || _d === void 0 ? void 0 : _d.email) === null || _e === void 0 ? void 0 : _e.email) !== null && _f !== void 0 ? _f : "unknown@email.com";
                console.log("✓ Authenticated");
                console.log("Logged in as: ".concat(email));
                return [3 /*break*/, 15];
            case 14:
                console.log("⚠ Not authenticated\n");
                console.log("Sign in using one of:");
                console.log("  1. Email OTP:");
                console.log("     npx tsx src/cli.ts auth login <your-email>");
                console.log("     npx tsx src/cli.ts auth verify <flow-id> <6-digit-code>");
                _r.label = 15;
            case 15:
                process.exit(0);
                _r.label = 16;
            case 16:
                if (!(args[0] === "auth" && args[1] === "verify")) return [3 /*break*/, 20];
                flowId = args[2];
                otp = args[3];
                if (!flowId || !otp) {
                    console.error("Usage: auth verify <flowId> <6-digit-code>");
                    process.exit(1);
                }
                console.log("Initializing CDP Core...");
                return [4 /*yield*/, (0, auth_persistence_1.restoreAuthState)()];
            case 17:
                _r.sent();
                return [4 /*yield*/, (0, initializeWithNodeCompat_1.initializeWithNodeCompat)(getConfig())];
            case 18:
                _r.sent();
                return [4 /*yield*/, runAuthVerify(flowId, otp)];
            case 19:
                _r.sent();
                process.exit(0);
                _r.label = 20;
            case 20:
                console.log("Initializing CDP Core...");
                return [4 /*yield*/, (0, auth_persistence_1.restoreAuthState)()];
            case 21:
                _r.sent();
                return [4 /*yield*/, (0, initializeWithNodeCompat_1.initializeWithNodeCompat)(getConfig())];
            case 22:
                _r.sent();
                console.log("SDK initialized successfully.");
                return [4 /*yield*/, (0, cdp_core_1.isSignedIn)()];
            case 23:
                signedIn = _r.sent();
                if (!!signedIn) return [3 /*break*/, 30];
                return [4 /*yield*/, (0, prompt_1.prompt)("Email: ")];
            case 24:
                email = _r.sent();
                if (!email) {
                    console.error("Email is required.");
                    process.exit(1);
                }
                return [4 /*yield*/, (0, cdp_core_1.signInWithEmail)({ email: email })];
            case 25:
                authResult = _r.sent();
                console.log("OTP sent to ".concat(email, ". Check your inbox."));
                return [4 /*yield*/, (0, prompt_1.prompt)("OTP: ")];
            case 26:
                otp = _r.sent();
                if (!otp) {
                    console.error("OTP is required.");
                    process.exit(1);
                }
                return [4 /*yield*/, (0, cdp_core_1.verifyEmailOTP)({
                        flowId: authResult.flowId,
                        otp: otp,
                    })];
            case 27:
                _r.sent();
                return [4 /*yield*/, (0, auth_persistence_1.persistAuthState)()];
            case 28:
                _r.sent();
                return [4 /*yield*/, (0, cdp_core_1.isSignedIn)()];
            case 29:
                signedIn = _r.sent();
                _r.label = 30;
            case 30:
                if (!signedIn) return [3 /*break*/, 34];
                return [4 /*yield*/, (0, cdp_core_1.getCurrentUser)()];
            case 31:
                user = _r.sent();
                console.log("User ID:", user === null || user === void 0 ? void 0 : user.userId);
                evmAddresses = (_h = (_g = user === null || user === void 0 ? void 0 : user.evmAccountObjects) === null || _g === void 0 ? void 0 : _g.map(function (a) { return a.address; })) !== null && _h !== void 0 ? _h : [];
                console.log("EVM Accounts:", evmAddresses);
                console.log("Solana Accounts:", (_k = (_j = user === null || user === void 0 ? void 0 : user.solanaAccountObjects) === null || _j === void 0 ? void 0 : _j.map(function (a) { return a.address; })) !== null && _k !== void 0 ? _k : []);
                if (!evmAddresses[0]) return [3 /*break*/, 33];
                address = evmAddresses[0];
                chain = "base";
                return [4 /*yield*/, Promise.all([
                        (0, balance_1.getAssetBalance)({ address: address, chain: chain }),
                        (0, balance_1.getTokenBalance)({
                            address: address,
                            tokenAddress: (0, chain_1.getUsdcAddress)(chain),
                            chain: chain,
                        }),
                    ])];
            case 32:
                _a = _r.sent(), eth = _a[0], usdc = _a[1];
                console.log("\nBalances (".concat((0, chain_1.getChainLabel)(chain), "):"));
                console.log("  ETH:  ".concat(eth.toFixed(6)));
                console.log("  USDC: ".concat(usdc.toFixed(2)));
                _r.label = 33;
            case 33: return [3 /*break*/, 35];
            case 34:
                console.log("No user signed in. Use signInWithEmail/verifyEmailOTP in a browser context.");
                _r.label = 35;
            case 35:
                console.log('Type "quit" to exit. Commands: balance [--chain base|base-sepolia], faucet [--asset eth|usdc]');
                _loop_1 = function () {
                    var input, chain, user, evmAddress, address, _s, eth, usdc, parts, assetIdx, asset, evmAddress_1, _t, links, withAddr_1;
                    return __generator(this, function (_u) {
                        switch (_u.label) {
                            case 0: return [4 /*yield*/, (0, prompt_1.prompt)("> ")];
                            case 1:
                                input = _u.sent();
                                if (input.toLowerCase() === "quit") {
                                    return [2 /*return*/, "break"];
                                }
                                if (!(input.toLowerCase().startsWith("balance") && signedIn)) return [3 /*break*/, 4];
                                chain = parseBalanceArgs(input).chain;
                                return [4 /*yield*/, (0, cdp_core_1.getCurrentUser)()];
                            case 2:
                                user = _u.sent();
                                evmAddress = (_m = (_l = user === null || user === void 0 ? void 0 : user.evmAccountObjects) === null || _l === void 0 ? void 0 : _l[0]) === null || _m === void 0 ? void 0 : _m.address;
                                if (!evmAddress) return [3 /*break*/, 4];
                                address = evmAddress;
                                return [4 /*yield*/, Promise.all([
                                        (0, balance_1.getAssetBalance)({ address: address, chain: chain }),
                                        (0, balance_1.getTokenBalance)({
                                            address: address,
                                            tokenAddress: (0, chain_1.getUsdcAddress)(chain),
                                            chain: chain,
                                        }),
                                    ])];
                            case 3:
                                _s = _u.sent(), eth = _s[0], usdc = _s[1];
                                console.log("[".concat((0, chain_1.getChainLabel)(chain), "] ETH: ").concat(eth.toFixed(6), ", USDC: ").concat(usdc.toFixed(2)));
                                _u.label = 4;
                            case 4:
                                if (!input.toLowerCase().startsWith("faucet")) return [3 /*break*/, 8];
                                parts = input.split(/\s+/);
                                assetIdx = parts.findIndex(function (p) { return p === "--asset"; });
                                asset = assetIdx >= 0 && parts[assetIdx + 1]
                                    ? parts[assetIdx + 1].toLowerCase()
                                    : "eth";
                                if (!signedIn) return [3 /*break*/, 6];
                                return [4 /*yield*/, (0, cdp_core_1.getCurrentUser)()];
                            case 5:
                                _t = (_q = (_p = (_o = (_u.sent())) === null || _o === void 0 ? void 0 : _o.evmAccountObjects) === null || _p === void 0 ? void 0 : _p[0]) === null || _q === void 0 ? void 0 : _q.address;
                                return [3 /*break*/, 7];
                            case 6:
                                _t = undefined;
                                _u.label = 7;
                            case 7:
                                evmAddress_1 = _t;
                                links = FAUCET_LINKS["base-sepolia"];
                                withAddr_1 = function (url) {
                                    return evmAddress_1
                                        ? "".concat(url).concat(url.includes("?") ? "&" : "?", "address=").concat(evmAddress_1)
                                        : url;
                                };
                                if (asset === "usdc") {
                                    console.log("Base Sepolia USDC faucet:");
                                    links.usdc.forEach(function (url) { return console.log("  ".concat(withAddr_1(url))); });
                                }
                                else {
                                    console.log("Base Sepolia ETH faucet:");
                                    links.eth.forEach(function (url) { return console.log("  ".concat(withAddr_1(url))); });
                                }
                                _u.label = 8;
                            case 8: return [2 /*return*/];
                        }
                    });
                };
                _r.label = 36;
            case 36:
                if (!true) return [3 /*break*/, 38];
                return [5 /*yield**/, _loop_1()];
            case 37:
                state_1 = _r.sent();
                if (state_1 === "break")
                    return [3 /*break*/, 38];
                return [3 /*break*/, 36];
            case 38:
                process.exit(0);
                return [2 /*return*/];
        }
    });
}); };
main().catch(function (err) {
    console.error(err);
    process.exit(1);
});
