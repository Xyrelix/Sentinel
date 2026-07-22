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
    let allowance: bigint;
    try {
      allowance = await getTokenAllowance(pair.token, address as Address, pair.spender);
    } catch {
      // A single bad/stale watchlist row (e.g. a non-contract or since-removed
      // token address) shouldn't take down the whole wallet-health check.
      riskFlags.push(
        `Could not check allowance for watched pair "${pair.label}" — the token address may be invalid.`
      );
      continue;
    }

    if (allowance > 0n) {
      approvals.push({
        token: pair.token,
        spender: pair.spender,
        amount: allowance.toString(),
        label: pair.label,
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