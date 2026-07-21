/**
 * api/walletHealth.ts
 *
 * Checks a wallet's token approvals against the Supabase-backed watchlist
 * and flags anything risky — the backend for the "Wallet Health Monitor"
 * and "One-Click Approval Revoke" features.
 */

import { isAddress, type Address } from "viem";
import { getTokenAllowance, getNativeBalance } from "../lib/xlayer/rpcClient";
import { getWatchedPairs } from "../lib/db/supabase";
import { isUnlimitedAmount } from "../lib/utils";
import type { WalletHealth, TokenApproval } from "@shared/types";

/**
 * Checks a wallet's approvals across the Supabase-backed watchlist and
 * returns a WalletHealth summary. Only reads on-chain state — never signs
 * or sends anything.
 */
export async function getWalletHealth(address: string): Promise<WalletHealth> {
  if (!isAddress(address, { strict: false })) {
    throw new Error(`Invalid wallet address: ${address}`);
  }

  const watchedPairs = await getWatchedPairs();
  const approvals: TokenApproval[] = [];
  const riskFlags: string[] = [];

  for (const pair of watchedPairs) {
    const allowance = await getTokenAllowance(
      pair.token,
      address as Address,
      pair.spender
    );

    if (allowance > 0n) {
      approvals.push({
        token: pair.token,
        spender: pair.spender,
        amount: allowance.toString(),
      });

      if (isUnlimitedAmount(allowance)) {
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