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
}

export interface ContractInspectionResult {
  address: string;
  isContract: boolean;
  bytecodeSize: number;
  simulationSucceeded: boolean;
  revertReason?: string;
  flags: ContractFlag[];
}

export type ContractFlag =
  | "not-a-contract"
  | "empty-bytecode"
  | "simulation-reverted"
  | "unlimited-approval-requested";
