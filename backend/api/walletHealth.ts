/**
 * api/walletHealth.ts
 *
 * Checks a wallet's token approvals against a known set of spenders and
 * flags anything risky — the backend for the "Wallet Health Monitor" and
 * "One-Click Approval Revoke" features.
 */

import { isAddress, type Address } from "viem";
import { getTokenAllowance, getNativeBalance } from "../lib/xlayer/rpcClient";
import type { WalletHealth, TokenApproval } from "@shared/types";

// Placeholder watchlist — tokens + known spender contracts to check
// approvals against. Replace with a real list (or a Supabase-backed one)
// as the "Community Intelligence" feature comes online.
const WATCHED_PAIRS: { token: Address; spender: Address; label: string }[] = [
  // { token: "0x...", spender: "0x...", label: "Example DEX Router" },
];

/**
 * Checks a wallet's approvals across the watched token/spender pairs and
 * returns a WalletHealth summary. Only reads on-chain state — never signs
 * or sends anything.
 */
export async function getWalletHealth(address: string): Promise<WalletHealth> {
  if (!isAddress(address)) {
    throw new Error(`Invalid wallet address: ${address}`);
  }

  const approvals: TokenApproval[] = [];
  const riskFlags: string[] = [];

  for (const pair of WATCHED_PAIRS) {
    const allowance = await getTokenAllowance(pair.token, address, pair.spender);
    if (allowance > 0n) {
      approvals.push({
        token: pair.token,
        spender: pair.spender,
        amount: allowance.toString(),
      });

      // Flag unlimited or near-unlimited approvals specifically.
      const MAX_UINT256 = 2n ** 256n - 1n;
      if (allowance === MAX_UINT256) {
        riskFlags.push(
          `Unlimited approval granted to ${pair.label} (${pair.spender})`
        );
      }
    }
  }

  // Low-balance check — not a security risk, but useful wallet-health context.
  const balance = await getNativeBalance(address as Address);
  if (balance === 0n) {
    riskFlags.push("Wallet has zero native OKB balance.");
  }

  return { address, approvals, riskFlags };
}