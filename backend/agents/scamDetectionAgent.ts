/**
 * agents/scamDetectionAgent.ts
 *
 * Top-level orchestrator — the only agent file api/scan.ts should import
 * directly. Wires contractInspector.ts -> riskAnalyzer.ts into a single
 * call, and is the natural place to add caching, logging, or additional
 * inspection passes later without changing api/scan.ts.
 */

import { inspectContract } from "./contractInspector";
import { analyzeRisk } from "./riskAnalyzer";
import { checkPhishingSite } from "../lib/goplus";
import { checkEthPhishingList } from "../lib/phishingList";
import type { RiskScore } from "@shared/types";
import type { TransactionRequestInput } from "../lib/xlayer/rpcClient";

/**
 * Runs the full pre-signature scam-detection pipeline on an unsigned
 * transaction and returns a RiskScore ready for the frontend to render.
 */
export async function scanTransaction(
  tx: TransactionRequestInput
): Promise<RiskScore> {
  const inspection = await inspectContract(tx);
  return analyzeRisk(inspection);
}

/**
 * Checks a domain/URL against two independent phishing-domain sources —
 * GoPlus and MetaMask's eth-phishing-detect — and returns a RiskScore in
 * the same shape as scanTransaction(). A domain isn't a blockchain address,
 * so none of contractInspector.ts's bytecode/simulation checks apply; this
 * is a separate, much simpler path. Each source is best-effort — one being
 * down doesn't block the other from still catching a match.
 */
export async function scanDomain(domain: string): Promise<RiskScore> {
  const reasons: string[] = [];
  let isPhishing = false;

  try {
    const goPlusResult = await checkPhishingSite(domain);
    if (goPlusResult.isPhishing) {
      isPhishing = true;
      reasons.push(...goPlusResult.reasons);
    }
  } catch {
    // best-effort — ignore
  }

  try {
    const metaMaskResult = await checkEthPhishingList(domain);
    if (metaMaskResult.isPhishing) {
      isPhishing = true;
      if (metaMaskResult.reason) reasons.push(metaMaskResult.reason);
    }
  } catch {
    // best-effort — ignore
  }

  if (isPhishing) {
    return { score: 95, label: "high-risk", reasons };
  }

  return {
    score: 0,
    label: "safe",
    reasons: ["No known phishing reports for this domain in GoPlus Security or MetaMask's eth-phishing-detect list."],
  };
}