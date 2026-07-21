/**
 * lib/xlayer/rpcClient.ts
 *
 * X Layer (OKX's zkEVM L2) RPC client.
 * Wraps viem to give the rest of the backend (agents/, api/) a single,
 * typed surface for reading on-chain data before a transaction is signed.
 *
 * Chain IDs:
 *   - X Layer Mainnet: 196
 *   - X Layer Testnet: 195
 *
 * Requires X_LAYER_RPC_URL in .env.local (see .env.example).
 */

import {
  createPublicClient,
  http,
  defineChain,
  type Address,
  type Hash,
  type PublicClient,
} from "viem";

// ---------------------------------------------------------------------------
// Chain definition
// ---------------------------------------------------------------------------

const isTestnet = process.env.X_LAYER_NETWORK === "testnet";

export const xLayer = defineChain({
  id: isTestnet ? 1952 : 196,
  name: isTestnet ? "X Layer Testnet" : "X Layer",
  nativeCurrency: { name: "OKB", symbol: "OKB", decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.X_LAYER_RPC_URL ?? ""] },
  },
  blockExplorers: {
    default: {
      name: "OKLink",
      url: isTestnet
        ? "https://www.oklink.com/x-layer-testnet"
        : "https://www.oklink.com/xlayer",
    },
  },
});

let client: PublicClient | null = null;

/** Returns a singleton viem PublicClient configured for X Layer. */
export function getXLayerClient(): PublicClient {
  if (!process.env.X_LAYER_RPC_URL) {
    throw new Error(
      "X_LAYER_RPC_URL is not set. Add it to backend/.env.local."
    );
  }
  if (!client) {
    client = createPublicClient({
      chain: xLayer,
      transport: http(process.env.X_LAYER_RPC_URL),
    });
  }
  return client;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TransactionRequestInput {
  from: Address;
  to: Address;
  data?: `0x${string}`;
  value?: bigint;
}

export interface ContractInfo {
  address: Address;
  isContract: boolean;
  bytecodeSize: number;
}

export interface SimulationResult {
  success: boolean;
  gasEstimate?: bigint;
  revertReason?: string;
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

/**
 * Fetches a submitted/mined transaction by hash — used when reviewing
 * transaction history for wallet health checks, not for pre-signature scans
 * (those come in as unsigned TransactionRequestInput, see below).
 */
export async function getTransactionByHash(hash: Hash) {
  const c = getXLayerClient();
  return c.getTransaction({ hash });
}

/**
 * Determines whether an address is a contract (has bytecode) or an EOA.
 * First signal used by contractInspector.ts — interacting with an EOA
 * masquerading as a token, for example, is itself a red flag.
 */
export async function getContractInfo(address: Address): Promise<ContractInfo> {
  const c = getXLayerClient();
  const bytecode = await c.getBytecode({ address });
  return {
    address,
    isContract: Boolean(bytecode && bytecode !== "0x"),
    bytecodeSize: bytecode ? (bytecode.length - 2) / 2 : 0, // hex string -> bytes
  };
}

/**
 * Simulates a transaction via eth_call before it's signed, to check whether
 * it would revert and to get a gas estimate. This is the core of the
 * "pre-signature" scan — we never broadcast, only simulate.
 */
export async function simulateTransaction(
  tx: TransactionRequestInput
): Promise<SimulationResult> {
  const c = getXLayerClient();
  try {
    const gasEstimate = await c.estimateGas({
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

/** Reads the native OKB balance for a given address. */
export async function getNativeBalance(address: Address): Promise<bigint> {
  const c = getXLayerClient();
  return c.getBalance({ address });
}

/**
 * Reads the ERC20 `allowance(owner, spender)` for a token — the core
 * primitive behind wallet-health approval checks and the one-click revoke
 * feature. Uses the minimal ERC20 ABI fragment needed.
 */
const ERC20_ALLOWANCE_ABI = [
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export async function getTokenAllowance(
  tokenAddress: Address,
  owner: Address,
  spender: Address
): Promise<bigint> {
  const c = getXLayerClient();
  return c.readContract({
    address: tokenAddress,
    abi: ERC20_ALLOWANCE_ABI,
    functionName: "allowance",
    args: [owner, spender],
  });
}