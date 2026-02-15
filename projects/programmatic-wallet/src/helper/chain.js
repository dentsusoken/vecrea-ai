"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsdcAddress = exports.getChainLabel = exports.getPublicClient = void 0;
var chains_1 = require("viem/chains");
var viem_1 = require("viem");
var CHAIN_CONFIG = {
    base: {
        chain: chains_1.base,
        usdc: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        label: "Base",
    },
    "base-sepolia": {
        chain: chains_1.baseSepolia,
        usdc: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
        label: "Base Sepolia",
    },
};
var clientCache = new Map();
var getPublicClient = function (chain) {
    var _a;
    if (chain === void 0) { chain = "base"; }
    var cached = clientCache.get(chain);
    if (cached) {
        return cached;
    }
    var config = (_a = CHAIN_CONFIG[chain]) !== null && _a !== void 0 ? _a : CHAIN_CONFIG.base;
    var client = (0, viem_1.createPublicClient)({
        chain: config.chain,
        transport: (0, viem_1.http)(),
    });
    clientCache.set(chain, client);
    return client;
};
exports.getPublicClient = getPublicClient;
var getChainLabel = function (chain) {
    var _a;
    var config = (_a = CHAIN_CONFIG[chain]) !== null && _a !== void 0 ? _a : CHAIN_CONFIG.base;
    return config.label;
};
exports.getChainLabel = getChainLabel;
var getUsdcAddress = function (chain) {
    var _a;
    var config = (_a = CHAIN_CONFIG[chain]) !== null && _a !== void 0 ? _a : CHAIN_CONFIG.base;
    return config.usdc;
};
exports.getUsdcAddress = getUsdcAddress;
