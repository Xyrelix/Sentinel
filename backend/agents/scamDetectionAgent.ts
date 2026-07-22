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
 * Checks a domain/URL against GoPlus's phishing-site database and returns a
 * RiskScore in the same shape as scanTransaction() — a domain isn't a
 * blockchain address, so none of contractInspector.ts's bytecode/simulation
 * checks apply; this is a separate, much simpler path.
 */
export async function scanDomain(domain: string): Promise<RiskScore> {
  const { isPhishing, reasons } = await checkPhishingSite(domain);

  if (isPhishing) {
    return { score: 95, label: "high-risk", reasons };
  }

  return {
    score: 0,
    label: "safe",
    reasons: ["No known phishing reports for this domain in GoPlus Security's database."],
  };
}