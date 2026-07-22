export type NavTab =
  | 'landing'
  | 'scanner'
  | 'wallet'
  | 'reports'
  | 'settings';

export type RiskLevel = 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface AIExplanation {
  whatWeFound: string;
  whyItMatters: string;
  potentialImpact: string;
  recommendedAction: string;
}

export interface ContractSecurityCheck {
  id: string;
  label: string;
  status: 'passed' | 'warning' | 'failed' | 'pending';
  details: string;
}

export interface ScanResult {
  id: string;
  targetAddress: string;
  targetName: string;
  network: string;
  riskScore: number; // 0 to 100
  riskLevel: RiskLevel;
  estimatedValueUsd: number;
  gasFeeEth: number;
  scamCategory?: string;
  checks: ContractSecurityCheck[];
  aiExplanation: AIExplanation;
  timestamp: string;
}

export interface ApprovalItem {
  id: string;
  tokenSymbol: string;
  tokenName: string;
  tokenIcon?: string;
  allowance: string; // e.g. "Unlimited" or "10,000 USDT"
  isUnlimited: boolean;
  spenderAddress: string;
  spenderName: string;
  riskLevel: RiskLevel;
  valueAtRiskUsd: number;
  protocol: string;
  lastUpdated: string;
}

export interface ThreatAlert {
  id: string;
  category: 'Phishing' | 'Fake Contract' | 'Rug Pull' | 'Wallet Drainer' | 'Unlimited Approval' | 'Blacklist';
  title: string;
  targetAddress: string;
  severity: RiskLevel;
  timestamp: string;
  description: string;
  reporter: string;
  upvotes: number;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  description: string;
}

export interface WalletState {
  isConnected: boolean;
  address: string;
  ensName?: string;
  network: string;
  balanceEth: number;
  balanceUsd: number;
  overallRiskScore: number;
}
