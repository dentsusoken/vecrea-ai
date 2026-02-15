import { base, baseSepolia } from "viem/chains";
import { type Address, type PublicClient, createPublicClient, http } from "viem";

const WETH_ADDRESS = "0x4200000000000000000000000000000000000006" as Address;

const CHAIN_CONFIG: Record<
  string,
  { chain: typeof base | typeof baseSepolia; usdc: Address; label: string }
> = {
  base: {
    chain: base,
    usdc: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    label: "Base",
  },
  "base-sepolia": {
    chain: baseSepolia,
    usdc: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    label: "Base Sepolia",
  },
};

const clientCache = new Map<string, PublicClient>();

export const SUPPORTED_CHAINS = ["base", "base-sepolia"] as const;

export const isSupportedChain = (chain: string): chain is (typeof SUPPORTED_CHAINS)[number] =>
  SUPPORTED_CHAINS.includes(chain.toLowerCase() as (typeof SUPPORTED_CHAINS)[number]);

export const getPublicClient = (chain: string = "base"): PublicClient => {
  const cached = clientCache.get(chain);
  if (cached) {
    return cached;
  }
  const config =
    (CHAIN_CONFIG as Record<string, (typeof CHAIN_CONFIG)["base"]>)[chain] ??
    CHAIN_CONFIG.base;
  const client = createPublicClient({
    chain: config.chain,
    transport: http(),
  }) as PublicClient;
  clientCache.set(chain, client);
  return client;
};

export const getChainLabel = (chain: string): string => {
  const config =
    (CHAIN_CONFIG as Record<string, (typeof CHAIN_CONFIG)["base"]>)[chain] ??
    CHAIN_CONFIG.base;
  return config.label;
};

export const getUsdcAddress = (chain: string): Address => {
  const config =
    (CHAIN_CONFIG as Record<string, (typeof CHAIN_CONFIG)["base"]>)[chain] ??
    CHAIN_CONFIG.base;
  return config.usdc;
};

export const getWethAddress = (): Address => WETH_ADDRESS;
