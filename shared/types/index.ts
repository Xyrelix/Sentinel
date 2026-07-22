export interface RiskScore {
  score: number;
  label: "safe" | "caution" | "high-risk";
  reasons: string[];
}

export interface WalletHealth {
  address: string;
  approvals: TokenApproval[];
  riskFlags: string[];
}

export interface TokenApproval {
  token: string;
  spender: string;
  amount: string;
  label?: string;
}

export interface ContractInspectionResult {
  address: string;
  isContract: boolean;
  bytecodeSize: number;
  simulationSucceeded: boolean;
  revertReason?: string;
  flags: ContractFlag[];
  // Specific human-readable findings from external threat-intel sources
  // (e.g. GoPlus) — richer than the generic per-flag reason text, since a
  // single flag can have several distinct underlying findings.
  externalFindings?: string[];
}

export type ContractFlag =
  | "not-a-contract"
  | "empty-bytecode"
  | "simulation-reverted"
  | "unlimited-approval-requested"
  | "goplus-malicious-address"
  | "goplus-honeypot-token";

export interface ThreatAlert {
  id: string;
  category: "Phishing" | "Fake Contract" | "Rug Pull" | "Wallet Drainer" | "Unlimited Approval" | "Blacklist";
  title: string;
  targetAddress: string;
  severity: "SAFE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  timestamp: string;
  description: string;
  reporter: string;
  upvotes: number;
}
