/**
 * agents/riskAnalyzer.ts
 *
 * Turns raw findings from contractInspector.ts into a scored, user-facing
 * RiskScore. This is the last step before scamDetectionAgent.ts hands the
 * result back to api/scan.ts.
 */

import type {
  ContractFlag,
  ContractInspectionResult,
  RiskScore,
} from "@shared/types";

// Points added to the risk score per flag. Higher = more severe.
// Total is clamped to 100.
const FLAG_WEIGHTS: Record<ContractFlag, number> = {
  "not-a-contract": 60,
  "empty-bytecode": 35,
  "simulation-reverted": 25,
  "unlimited-approval-requested": 70,
  "goplus-malicious-address": 85,
  "goplus-honeypot-token": 80,
  "chainabuse-reported-address": 80,
};

// Human-readable explanation shown to the user for each flag. Where a flag
// has specific external findings (currently only the goplus-* flags), those
// get appended verbatim in analyzeRisk() below rather than relying solely on
// this generic line — a single flag can have several distinct findings.
const FLAG_REASONS: Record<ContractFlag, string> = {
  "not-a-contract":
    "The target address has no contract code — it's a regular wallet, not the token or dApp it claims to be.",
  "empty-bytecode":
    "The contract's code is unusually small for what it claims to do — a common sign of a hastily deployed scam contract.",
  "simulation-reverted":
    "Simulating this transaction failed, meaning it would likely fail (or behave unexpectedly) if you signed it.",
  "unlimited-approval-requested":
    "This transaction asks for unlimited spending approval on a token — it could drain your balance at any point in the future, not just now.",
  "goplus-malicious-address":
    "This address matches known malicious activity in GoPlus Security's real-world threat intelligence database.",
  "goplus-honeypot-token":
    "GoPlus Security's live token analysis flagged this contract with honeypot or scam-tax characteristics.",
  "chainabuse-reported-address":
    "This address has been reported to Chainabuse's community-sourced scam database.",
};

function scoreToLabel(score: number): RiskScore["label"] {
  if (score >= 60) return "high-risk";
  if (score >= 25) return "caution";
  return "safe";
}

/**
 * Converts a ContractInspectionResult into a RiskScore.
 * Pure function — no I/O, easy to unit test in isolation.
 */
export function analyzeRisk(
  inspection: ContractInspectionResult
): RiskScore {
  const reasons: string[] = [];
  let score = 0;

  for (const flag of inspection.flags) {
    score += FLAG_WEIGHTS[flag];
    reasons.push(FLAG_REASONS[flag]);
  }

  // Extra context in the reasons list if simulation gave us a revert reason.
  if (inspection.revertReason) {
    reasons.push(`Simulation error: ${inspection.revertReason}`);
  }

  // Specific external threat-intel findings (e.g. GoPlus) — richer than the
  // generic per-flag reason above, since a flag can have several distinct
  // underlying findings.
  if (inspection.externalFindings?.length) {
    reasons.push(...inspection.externalFindings);
  }

  score = Math.min(score, 100);

  // Clean contract, no flags at all — give an explicit "all clear" reason.
  if (reasons.length === 0) {
    reasons.push("No known risk patterns detected in this transaction.");
  }

  return {
    score,
    label: scoreToLabel(score),
    reasons,
  };
}