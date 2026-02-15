import { type Address, formatEther, formatUnits } from "viem";
import { getPublicClient } from "./chain";

const ERC20_BALANCE_ABI = [
  {
    name: "balanceOf",
    type: "function",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
] as const;

export const getAssetBalance = async (params: {
  address: Address;
  chain?: string;
}): Promise<bigint> => {
  const chain = params.chain ?? "base";
  const client = getPublicClient(chain);
  return client.getBalance({ address: params.address });
};

export const getTokenBalance = async (params: {
  address: Address;
  tokenAddress: Address;
  chain?: string;
  decimals?: number;
}): Promise<bigint> => {
  const chain = params.chain ?? "base";
  const client = getPublicClient(chain);
  return client.readContract({
    address: params.tokenAddress,
    abi: ERC20_BALANCE_ABI,
    functionName: "balanceOf",
    args: [params.address],
  }) as Promise<bigint>;
};

export const formatAssetBalance = (wei: bigint): string => formatEther(wei);

export const formatTokenBalance = (raw: bigint, decimals: number): string =>
  formatUnits(raw, decimals);
