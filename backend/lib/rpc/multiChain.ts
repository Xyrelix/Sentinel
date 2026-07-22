/**
 * lib/rpc/multiChain.ts
 *
 * Generic multichain RPC access for contract analysis (bytecode presence,
 * transaction simulation) - the piece that was still X-Layer-only even
 * after the GoPlus/Chainabuse threat-intel checks became multichain.
 * X Layer keeps using this backend's own configured X_LAYER_RPC_URL (real,
 * already verified); other chains use their official/well-known public RPC
 * endpoints (verified live, no key needed).
 *
 * Kept separate from lib/xlayer/rpcClient.ts on purpose: wallet-health,
 * approvals, and revoke are conceptually X-Layer-specific features (they're
 * built around the X-Layer-only watched_pairs table) and stay on that
 * dedicated client unchanged.
 */

import { createPublicClient, http, defineChain, type Address, type PublicClient } from "viem";

interface ChainConfig {
  name: string;
  rpcUrl: string;
  nativeSymbol: string;
}

const CHAIN_REGISTRY: Record<number, ChainConfig> = {
  1: { name: "Ethereum", rpcUrl: "https://ethereum.publicnode.com", nativeSymbol: "ETH" },
  10: { name: "Optimism", rpcUrl: "https://mainnet.optimism.io", nativeSymbol: "ETH" },
  56: { name: "BNB Chain", rpcUrl: "https://bsc-dataseed.binance.org", nativeSymbol: "BNB" },
  137: { name: "Polygon", rpcUrl: "https://polygon.publicnode.com", nativeSymbol: "POL" },
  8453: { name: "Base", rpcUrl: "https://mainnet.base.org", nativeSymbol: "ETH" },
  42161: { name: "Arbitrum One", rpcUrl: "https://arb1.arbitrum.io/rpc", nativeSymbol: "ETH" },
  43114: { name: "Avalanche", rpcUrl: "https://api.avax.network/ext/bc/C/rpc", nativeSymbol: "AVAX" },
  196: { name: "OKX X Layer", rpcUrl: process.env.X_LAYER_RPC_URL ?? "", nativeSymbol: "OKB" },
};

export function isSupportedChain(chainId: number): boolean {
  return chainId in CHAIN_REGISTRY && Boolean(CHAIN_REGISTRY[chainId].rpcUrl);
}

export function getChainName(chainId: number): string {
  return CHAIN_REGISTRY[chainId]?.name ?? `Chain ${chainId}`;
}

const clientCache = new Map<number, PublicClient>();

function getClientForChain(chainId: number): PublicClient {
  const config = CHAIN_REGISTRY[chainId];
  if (!config || !config.rpcUrl) {
    throw new Error(
      chainId === 196
        ? "X_LAYER_RPC_URL is not set. Add it to backend/.env.local."
        : `No RPC configured for chain ${chainId}.`
    );
  }

  const cached = clientCache.get(chainId);
  if (cached) return cached;

  const chain = defineChain({
    id: chainId,
    name: config.name,
    nativeCurrency: { name: config.nativeSymbol, symbol: config.nativeSymbol, decimals: 18 },
    rpcUrls: { default: { http: [config.rpcUrl] } },
  });
  const client = createPublicClient({ chain, transport: http(config.rpcUrl) });
  clientCache.set(chainId, client);
  return client;
}

export interface ContractInfo {
  address: Address;
  isContract: boolean;
  bytecodeSize: number;
}

/** Determines whether an address is a contract (has bytecode) or an EOA, on the given chain. */
export async function getContractInfoForChain(address: Address, chainId: number): Promise<ContractInfo> {
  const client = getClientForChain(chainId);
  const bytecode = await client.getBytecode({ address });
  return {
    address,
    isContract: Boolean(bytecode && bytecode !== "0x"),
    bytecodeSize: bytecode ? (bytecode.length - 2) / 2 : 0,
  };
}

export interface SimulationResult {
  success: boolean;
  gasEstimate?: bigint;
  revertReason?: string;
}

export interface TransactionRequestInput {
  from: Address;
  to: Address;
  data?: `0x${string}`;
  value?: bigint;
}

/** Simulates a transaction via eth_call/estimateGas on the given chain, before it's ever signed. */
export async function simulateTransactionForChain(
  tx: TransactionRequestInput,
  chainId: number
): Promise<SimulationResult> {
  const client = getClientForChain(chainId);
  try {
    const gasEstimate = await client.estimateGas({
      account: tx.from,
      to: tx.to,
      data: tx.data,
      value: tx.value ?? 0n,
    });
    return { success: true, gasEstimate };
  } catch (err) {
    return {
      success: false,
      revertReason: err instanceof Error ? err.message : "Unknown revert",
    };
  }
}
