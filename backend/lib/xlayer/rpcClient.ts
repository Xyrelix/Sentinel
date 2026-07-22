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
 *
 * Scope note: bytecode/simulation checks for scanning now live in
 * lib/rpc/multiChain.ts (multichain, X Layer included via its own registry
 * entry). This file stays dedicated to the genuinely X-Layer-specific
 * features - wallet-health/approvals and signature verification - that are
 * conceptually tied to X Layer, not "whichever chain the user is scanning".
 */

import { createPublicClient, http, defineChain, type Address, type PublicClient } from "viem";

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

/** Reads the native OKB balance for a given address. */
export async function getNativeBalance(address: Address): Promise<bigint> {
  const c = getXLayerClient();
  return c.getBalance({ address });
}

/**
 * Reads the ERC20 `allowance(owner, spender)` for a token - the core
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
