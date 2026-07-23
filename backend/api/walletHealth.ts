/**
 * api/walletHealth.ts
 *
 * Checks a wallet's token approvals against the Supabase-backed watchlist
 * and flags anything risky - the backend for the "Wallet Health Monitor"
 * and "One-Click Approval Revoke" features. Also computes the dashboard's
 * three headline metrics (contract safety, unlimited-approval USD exposure,
 * phishing-target score) from this same real data - see the formulas below.
 */

import { isAddress, type Address } from "viem";
import {
  getTokenAllowance,
  getNativeBalance,
  getTokenBalance,
  getTokenDecimals,
} from "../lib/xlayer/rpcClient";
import { getWatchedPairs, getThreatReports } from "../lib/db/supabase";
import { isUnlimitedAmount } from "../lib/utils";
import { checkAddressSecurity } from "../lib/goplus";
import { checkChainabuseAddress } from "../lib/chainabuse";
import { getTokenPriceUsd } from "../lib/pricing";
import type { WalletHealth, TokenApproval } from "@shared/types";

const X_LAYER_CHAIN_ID = 196;

/**
 * Checks a wallet's approvals across the Supabase-backed watchlist and
 * returns a WalletHealth summary. Only reads on-chain state - never signs
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
        `Could not check allowance for watched pair "${pair.label}" - the token address may be invalid.`
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

  // Low-balance check - not a security risk, but useful wallet-health context.
  const balance = await getNativeBalance(address as Address);
  if (balance === 0n) {
    riskFlags.push("Wallet has zero native OKB balance.");
  }

  // --- Unlimited Approval Exposure (USD) ---------------------------------
  // The real dollar amount currently drainable via each unlimited approval
  // is the wallet's live balance of that token, not the (often
  // effectively-infinite) approved amount. Priced via CoinGecko; tokens
  // CoinGecko doesn't list are excluded from the sum (best-effort, noted
  // once rather than per-token to avoid spamming riskFlags).
  let unlimitedApprovalExposureUsd = 0;
  let unpricedUnlimitedCount = 0;
  const unlimitedApprovals = approvals.filter((a) => isUnlimitedAmount(BigInt(a.amount)));

  await Promise.all(
    unlimitedApprovals.map(async (approval) => {
      try {
        const [tokenBalance, decimals, priceUsd] = await Promise.all([
          getTokenBalance(approval.token as Address, address as Address),
          getTokenDecimals(approval.token as Address),
          getTokenPriceUsd(X_LAYER_CHAIN_ID, approval.token),
        ]);
        const valueUsd = (Number(tokenBalance) / 10 ** decimals) * priceUsd;
        approval.valueUsd = valueUsd;
        unlimitedApprovalExposureUsd += valueUsd;
      } catch {
        unpricedUnlimitedCount += 1;
      }
    })
  );

  if (unpricedUnlimitedCount > 0) {
    riskFlags.push(
      `Could not determine a live USD price for ${unpricedUnlimitedCount} unlimited-approval token(s) - they are excluded from the exposure total below.`
    );
  }

  // --- Contract Interaction Safety ---------------------------------------
  // Runs real threat-intel (GoPlus + Chainabuse) against every unique
  // spender this wallet has actually granted a nonzero allowance to. 100 =
  // no interactions flagged (or no interactions at all); drops toward 0 as
  // more of those spenders turn out to be reported malicious.
  const uniqueSpenders = Array.from(new Set(approvals.map((a) => a.spender)));
  let badSpenderCount = 0;

  await Promise.all(
    uniqueSpenders.map(async (spender) => {
      const [goPlusResult, chainabuseResult] = await Promise.all([
        checkAddressSecurity(spender, X_LAYER_CHAIN_ID).catch(() => ({ isMalicious: false, reasons: [] })),
        checkChainabuseAddress(spender).catch(() => ({ isReported: false, reportCount: 0, reasons: [] })),
      ]);
      if (goPlusResult.isMalicious || chainabuseResult.isReported) {
        badSpenderCount += 1;
      }
    })
  );

  const contractSafetyScore =
    uniqueSpenders.length === 0
      ? 100
      : Math.round(100 * (1 - badSpenderCount / uniqueSpenders.length));

  // --- Phishing Target Score ----------------------------------------------
  // How many community-submitted threat_reports (Supabase) name this exact
  // wallet address as their target - the only real, first-party signal we
  // have for "has this wallet actually been reported as a phishing target."
  // Each matching report adds 0.25, capped at 1.
  let targetReportCount = 0;
  try {
    const threatReports = await getThreatReports();
    targetReportCount = threatReports.filter(
      (r) => r.targetAddress.toLowerCase() === address.toLowerCase()
    ).length;
  } catch {
    // best-effort - Supabase being unreachable shouldn't fail the whole check.
  }
  const phishingTargetScore = Math.min(1, Math.round(targetReportCount * 0.25 * 100) / 100);

  return {
    address,
    approvals,
    riskFlags,
    contractSafetyScore,
    unlimitedApprovalExposureUsd,
    phishingTargetScore,
  };
}
