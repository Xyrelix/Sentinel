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