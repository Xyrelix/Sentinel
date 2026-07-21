import { create } from 'zustand';
import { NavTab, WalletState, ScanResult, ApprovalItem, ThreatAlert, ToastMessage } from '../types/sentinel';

// Initial Mock Approvals
const initialApprovals: ApprovalItem[] = [
  {
    id: 'app-1',
    tokenSymbol: 'USDT',
    tokenName: 'Tether USD',
    allowance: 'Unlimited',
    isUnlimited: true,
    spenderAddress: '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD',
    spenderName: 'Unknown Malicious Router (Drainer)',
    riskLevel: 'CRITICAL',
    valueAtRiskUsd: 14250,
    protocol: 'Unverified DApp',
    lastUpdated: '2 hours ago',
  },
  {
    id: 'app-2',
    tokenSymbol: 'WETH',
    tokenName: 'Wrapped Ether',
    allowance: 'Unlimited',
    isUnlimited: true,
    spenderAddress: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
    spenderName: 'Uniswap V3 Router',
    riskLevel: 'LOW',
    valueAtRiskUsd: 8400,
    protocol: 'Uniswap V3',
    lastUpdated: '3 days ago',
  },
  {
    id: 'app-3',
    tokenSymbol: 'PEPE',
    tokenName: 'Pepe Token',
    allowance: '500,000,000',
    isUnlimited: false,
    spenderAddress: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    spenderName: 'Uniswap V2 Router',
    riskLevel: 'MEDIUM',
    valueAtRiskUsd: 1200,
    protocol: 'Uniswap V2',
    lastUpdated: '1 week ago',
  },
  {
    id: 'app-4',
    tokenSymbol: 'OKB',
    tokenName: 'OKB Utility Token',
    allowance: 'Unlimited',
    isUnlimited: true,
    spenderAddress: '0x8888888888888888888888888888888888888888',
    spenderName: 'Suspicious Yield Vault',
    riskLevel: 'HIGH',
    valueAtRiskUsd: 6500,
    protocol: 'Fake Staking Contract',
    lastUpdated: '5 hours ago',
  },
];

// Initial Threat Feed
const initialThreats: ThreatAlert[] = [
  {
    id: 'threat-1',
    category: 'Wallet Drainer',
    title: 'Fake OKX Web3 Airdrop Phishing Site',
    targetAddress: '0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5',
    severity: 'CRITICAL',
    timestamp: '10 mins ago',
    description: 'Deploys a zero-transfer approval claim signature that bypasses hardware wallet prompts.',
    reporter: 'Sentinel AI Guardian #04',
    upvotes: 142,
  },
  {
    id: 'threat-2',
    category: 'Rug Pull',
    title: 'Honeypot Token: $OKXAI',
    targetAddress: '0x498b8c56858e70a1a0937a09d3b1dbdbfef52b21',
    severity: 'HIGH',
    timestamp: '25 mins ago',
    description: 'Contract contains hidden sell fee of 99.5% and blacklists sell transfers after liquidity add.',
    reporter: 'Sentinels Core Security Engine',
    upvotes: 98,
  },
  {
    id: 'threat-3',
    category: 'Fake Contract',
    title: 'Spoofed Uniswap V4 Permit2 Router',
    targetAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    severity: 'CRITICAL',
    timestamp: '1 hour ago',
    description: 'Mimics Uniswap domain name but executes batch ERC-20 transferFrom to an offshore mixer.',
    reporter: 'Community Auditor @AlexWeb3',
    upvotes: 210,
  },
];

// Preset Scans for Instant Simulation
export const PRESET_SCANS: Record<string, ScanResult> = {
  drainer: {
    id: 'preset-drainer',
    targetAddress: '0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5',
    targetName: 'Claim Rewards (Permit2 Drainer)',
    network: 'OKX X Layer Mainnet',
    riskScore: 96,
    riskLevel: 'CRITICAL',
    scamCategory: 'Wallet Drainer',
    estimatedValueUsd: 12500,
    gasFeeEth: 0.0012,
    timestamp: 'Just now',
    checks: [
      { id: 'c1', label: 'Bytecode & Source Verification', status: 'failed', details: 'Unverified proxy bytecode with obfuscated DELEGATECALL instructions.' },
      { id: 'c2', label: 'Token Approval Request', status: 'failed', details: 'Requests unlimited allowance for all ERC-20 tokens in wallet.' },
      { id: 'c3', label: 'Phishing Database Match', status: 'failed', details: 'Matched with 3 active malware telemetry feeds.' },
      { id: 'c4', label: 'Simulated Execution', status: 'failed', details: 'Execution drains 100% of USDT & WETH balance in single transaction.' },
    ],
    aiExplanation: {
      whatWeFound: 'This transaction executes an unverified permit signature that grants full access to your entire token wallet.',
      whyItMatters: 'If signed, an attacker can instantly drain all your funds without asking for further approval.',
      potentialImpact: 'Estimated loss of $12,500 USDT and 3.2 WETH currently stored in your connected address.',
      recommendedAction: 'REJECT THIS TRANSACTION IMMEDIATELY. Do not sign or approve any signatures from this domain.',
    },
  },
  safe: {
    id: 'preset-safe',
    targetAddress: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
    targetName: 'Uniswap V3 ExactInputSingle Router',
    network: 'OKX X Layer Mainnet',
    riskScore: 8,
    riskLevel: 'SAFE',
    scamCategory: 'Verified DEX Swap',
    estimatedValueUsd: 450,
    gasFeeEth: 0.0004,
    timestamp: 'Just now',
    checks: [
      { id: 'c1', label: 'Bytecode & Source Verification', status: 'passed', details: 'Fully open-source, verified smart contract match.' },
      { id: 'c2', label: 'Slippage & Price Impact', status: 'passed', details: 'Price impact is 0.02% with valid routing liquidity.' },
      { id: 'c3', label: 'Slippage Protection', status: 'passed', details: 'Minimum output amount set safely in parameters.' },
      { id: 'c4', label: 'Simulated Execution', status: 'passed', details: 'Swaps 0.15 ETH for 450 USDT cleanly.' },
    ],
    aiExplanation: {
      whatWeFound: 'Standard token swap interaction routed through the official Uniswap V3 Smart Contracts.',
      whyItMatters: 'The contract logic has undergone multiple public audits and has no malicious backdoors.',
      potentialImpact: 'Your transaction will execute as intended with minimal slippage and safe returns.',
      recommendedAction: 'SAFE TO SIGN. You can proceed with confidence.',
    },
  },
  honeypot: {
    id: 'preset-honeypot',
    targetAddress: '0x498b8c56858e70a1a0937a09d3b1dbdbfef52b21',
    targetName: '$OKXAI Meme Token Swap',
    network: 'OKX X Layer Mainnet',
    riskScore: 88,
    riskLevel: 'HIGH',
    scamCategory: 'Honeypot / Tax Scam',
    estimatedValueUsd: 1200,
    gasFeeEth: 0.0018,
    timestamp: 'Just now',
    checks: [
      { id: 'c1', label: 'Sell Ability Check', status: 'failed', details: 'Sell transfers revert for non-whitelisted addresses (Honeypot).' },
      { id: 'c2', label: 'Dynamic Tax Analysis', status: 'warning', details: 'Buy tax is 0%, but Sell tax dynamic rate is 99%.' },
      { id: 'c3', label: 'Owner Privileges', status: 'failed', details: 'Owner can pause trading or mint arbitrary token supply.' },
      { id: 'c4', label: 'Liquidity Lock', status: 'failed', details: 'Liquidity is unlocked and can be removed instantly by creator.' },
    ],
    aiExplanation: {
      whatWeFound: 'This token features a Honeypot smart contract mechanism where buying is enabled but selling is restricted.',
      whyItMatters: 'You will be able to buy the tokens, but you will NEVER be able to sell or swap them back to ETH/USDT.',
      potentialImpact: '100% loss of invested capital ($1,200).',
      recommendedAction: 'DO NOT BUY THIS TOKEN. High probability of complete capital loss.',
    },
  },
};

interface SentinelStore {
  // Navigation
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;

  // Custom Cursor toggle
  customCursorEnabled: boolean;
  setCustomCursorEnabled: (enabled: boolean) => void;

  // Wallet State
  wallet: WalletState;
  connectWallet: () => void;
  disconnectWallet: () => void;
  isConnectModalOpen: boolean;
  setConnectModalOpen: (open: boolean) => void;

  // Scanner State
  currentScanInput: string;
  setCurrentScanInput: (input: string) => void;
  isScanning: boolean;
  scanProgress: number; // 0 to 100
  scanStage: string;
  activeScanResult: ScanResult | null;
  startScan: (presetKey?: string) => void;

  // Approvals State
  approvals: ApprovalItem[];
  revokeApproval: (id: string) => void;

  // Threat Alerts
  threats: ThreatAlert[];
  addThreatReport: (threat: Omit<ThreatAlert, 'id' | 'timestamp' | 'upvotes'>) => void;

  // Toasts
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;

  // Settings
  autoScanEnabled: boolean;
  setAutoScanEnabled: (enabled: boolean) => void;
  riskThreshold: number;
  setRiskThreshold: (val: number) => void;
}

export const useSentinelStore = create<SentinelStore>((set, get) => ({
  activeTab: 'landing',
  setActiveTab: (tab) => set({ activeTab: tab }),

  customCursorEnabled: false,
  setCustomCursorEnabled: (enabled) => set({ customCursorEnabled: enabled }),

  wallet: {
    isConnected: true,
    address: '0x71C...4F9A',
    ensName: 'alex.okx.eth',
    network: 'OKX X Layer Mainnet',
    balanceEth: 14.28,
    balanceUsd: 42840,
    overallRiskScore: 23,
  },
  connectWallet: () => {
    set((state) => ({
      wallet: { ...state.wallet, isConnected: true },
      isConnectModalOpen: false,
    }));
    get().addToast({
      type: 'success',
      title: 'Wallet Connected',
      description: 'Connected securely to 0x71C...4F9A on OKX X Layer.',
    });
  },
  disconnectWallet: () => {
    set((state) => ({
      wallet: { ...state.wallet, isConnected: false },
    }));
    get().addToast({
      type: 'info',
      title: 'Wallet Disconnected',
      description: 'Your session has been safely closed.',
    });
  },
  isConnectModalOpen: false,
  setConnectModalOpen: (open) => set({ isConnectModalOpen: open }),

  currentScanInput: '0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5',
  setCurrentScanInput: (input) => set({ currentScanInput: input }),
  isScanning: false,
  scanProgress: 0,
  scanStage: 'Initializing AI Engine...',
  activeScanResult: PRESET_SCANS.drainer,

  startScan: (presetKey) => {
    const chosenPreset = presetKey && PRESET_SCANS[presetKey] ? PRESET_SCANS[presetKey] : PRESET_SCANS.drainer;
    
    set({
      isScanning: true,
      scanProgress: 5,
      scanStage: 'Fetching Contract Bytecode & ABI...',
      activeScanResult: null,
    });

    // Simulated scan sequence for dramatic AI feedback
    const stages = [
      { progress: 25, stage: 'Scanning Bytecode for Malicious Patterns...' },
      { progress: 50, stage: 'Analyzing ERC-20 Allowances & Permit Signatures...' },
      { progress: 75, stage: 'Running AI Deep Threat Vector Simulation...' },
      { progress: 95, stage: 'Generating Plain-English Risk Report...' },
    ];

    stages.forEach((item, index) => {
      setTimeout(() => {
        set({ scanProgress: item.progress, scanStage: item.stage });
      }, (index + 1) * 600);
    });

    setTimeout(() => {
      set({
        isScanning: false,
        scanProgress: 100,
        scanStage: 'Scan Complete',
        activeScanResult: {
          ...chosenPreset,
          targetAddress: get().currentScanInput || chosenPreset.targetAddress,
          timestamp: 'Just now',
        },
      });

      get().addToast({
        type: chosenPreset.riskScore > 50 ? 'warning' : 'success',
        title: 'Scan Finished',
        description: `Risk Score: ${chosenPreset.riskScore}% (${chosenPreset.riskLevel})`,
      });
    }, 3200);
  },

  approvals: initialApprovals,
  revokeApproval: (id) => {
    const target = get().approvals.find((a) => a.id === id);
    set((state) => ({
      approvals: state.approvals.filter((a) => a.id !== id),
    }));

    if (target) {
      get().addToast({
        type: 'success',
        title: 'Approval Revoked',
        description: `Successfully revoked allowance for ${target.tokenSymbol} (${target.spenderName}).`,
      });
    }
  },

  threats: initialThreats,
  addThreatReport: (newThreat) => {
    const item: ThreatAlert = {
      ...newThreat,
      id: `threat-${Date.now()}`,
      timestamp: 'Just now',
      upvotes: 1,
    };
    set((state) => ({ threats: [item, ...state.threats] }));
    get().addToast({
      type: 'info',
      title: 'Scam Report Submitted',
      description: 'Thank you for protecting the Web3 community!',
    });
  },

  toasts: [],
  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    setTimeout(() => {
      get().removeToast(id);
    }, 4500);
  },
  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },

  autoScanEnabled: true,
  setAutoScanEnabled: (enabled) => set({ autoScanEnabled: enabled }),
  riskThreshold: 70,
  setRiskThreshold: (val) => set({ riskThreshold: val }),
}));
