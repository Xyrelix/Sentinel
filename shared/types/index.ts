export interface RiskScore {
  score: number;
  label: "safe" | "caution" | "high-risk";
  reasons: string[];
}

export interface WalletHealth {
  address: string;
  approvals: TokenApproval[];
  riskFlags: string[];
  // 0-100, higher = safer. Derived from real-time GoPlus/Chainabuse checks
  // against every unique spender this wallet has actually granted an
  // allowance to - see backend/api/walletHealth.ts for the formula.
  contractSafetyScore: number;
  // Real USD value at risk from this wallet's unlimited approvals: current
  // token balance x live CoinGecko price, summed across every unlimited
  // approval whose token could be priced. Approvals for unpriced tokens are
  // excluded from the sum (see riskFlags for a note when that happens).
  unlimitedApprovalExposureUsd: number;
  // 0-1, higher = more targeted. Derived from how many community-submitted
  // threat_reports (Supabase) name this exact address as their target.
  phishingTargetScore: number;
}

export interface TokenApproval {
  token: string;
  spender: string;
  amount: string;
  label?: string;
  // Real USD value of the wallet's current balance of this token - only
  // computed for unlimited approvals where a live CoinGecko price was found.
  valueUsd?: number;
}

export interface ContractInspectionResult {
  address: string;
  isContract: boolean;
  bytecodeSize: number;
  simulationSucceeded: boolean;
  revertReason?: string;
  flags: ContractFlag[];
  // Specific human-readable findings from external threat-intel sources
  // (e.g. GoPlus) - richer than the generic per-flag reason text, since a
  // single flag can have several distinct underlying findings.
  externalFindings?: string[];
}

export type ContractFlag =
  | "not-a-contract"
  | "empty-bytecode"
  | "simulation-reverted"
  | "unlimited-approval-requested"
  | "goplus-malicious-address"
  | "goplus-honeypot-token"
  | "chainabuse-reported-address";

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
