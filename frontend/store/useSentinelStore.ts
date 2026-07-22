import { create } from 'zustand';
import { NavTab, WalletState, ScanResult, RiskLevel, ToastMessage } from '../types/sentinel';
import {
  connect as web3Connect,
  refreshBalance,
  scanAddress,
  formatEther,
  shortenAddress,
  isValidAddress,
  ScanFinding,
  X_LAYER_CHAIN_ID,
} from '../lib/web3';

const EMPTY_WALLET: WalletState = {
  isConnected: false,
  address: '',
  network: '',
  balanceEth: 0,
  balanceUsd: 0,
  overallRiskScore: 0,
};

function findingToRiskLevel(finding: ScanFinding): RiskLevel {
  if (finding.score >= 60) return 'CRITICAL';
  if (finding.score >= 40) return 'HIGH';
  if (finding.score >= 25) return 'MEDIUM';
  if (finding.score > 0) return 'LOW';
  return 'SAFE';
}

function buildScanResult(address: string, finding: ScanFinding): ScanResult {
  const riskLevel = findingToRiskLevel(finding);
  const safe = finding.label === 'safe';

  return {
    id: `scan-${address.toLowerCase()}`,
    targetAddress: address,
    targetName: finding.isContract ? 'Smart Contract' : 'Externally Owned Account',
    network: 'OKX X Layer',
    riskScore: finding.score,
    riskLevel,
    scamCategory: finding.flags[0],
    estimatedValueUsd: 0,
    gasFeeEth: 0,
    timestamp: 'Just now',
    checks: [
      {
        id: 'c1',
        label: 'Contract Code Present',
        status: finding.isContract ? 'passed' : 'failed',
        details: finding.isContract
          ? `Address holds ${finding.bytecodeSize} bytes of contract code.`
          : 'Address has no contract code — it is a regular wallet (EOA).',
      },
      {
        id: 'c2',
        label: 'Bytecode Size Sanity',
        status: finding.flags.includes('empty-bytecode') ? 'warning' : 'passed',
        details: finding.flags.includes('empty-bytecode')
          ? 'Contract code is unusually small for a typical token or dApp.'
          : 'Bytecode size is within a normal range for on-chain contracts.',
      },
    ],
    aiExplanation: {
      whatWeFound: finding.reasons.join(' '),
      whyItMatters: safe
        ? 'No high-risk code patterns were detected from on-chain inspection.'
        : 'The findings above are common indicators of scam or unsafe contracts.',
      potentialImpact: safe
        ? 'Standard interaction risk applies. Always verify the source of any transaction.'
        : 'Interacting with this address could put your funds at risk.',
      recommendedAction: safe
        ? 'Proceed with normal caution and verify the dApp source.'
        : 'Avoid signing transactions with this address until it is verified.',
    },
  };
}

interface SentinelStore {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;

  customCursorEnabled: boolean;
  setCustomCursorEnabled: (enabled: boolean) => void;

  wallet: WalletState;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isConnectModalOpen: boolean;
  setConnectModalOpen: (open: boolean) => void;

  currentScanInput: string;
  setCurrentScanInput: (input: string) => void;
  isScanning: boolean;
  scanProgress: number;
  scanStage: string;
  activeScanResult: ScanResult | null;
  scanError: string | null;
  startScan: () => Promise<void>;

  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;

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

  wallet: EMPTY_WALLET,
  isConnecting: false,
  connectWallet: async () => {
    if (get().isConnecting) return;
    set({ isConnecting: true });
    try {
      const result = await web3Connect();
      set({
        wallet: {
          isConnected: true,
          address: result.address,
          network: result.chainId === X_LAYER_CHAIN_ID ? 'OKX X Layer' : `Chain ${result.chainId}`,
          balanceEth: Number(formatEther(result.balanceWei, 6)),
          balanceUsd: 0,
          overallRiskScore: 0,
        },
        isConnectModalOpen: false,
        isConnecting: false,
      });
      get().addToast({
        type: result.chainId === X_LAYER_CHAIN_ID ? 'success' : 'warning',
        title: 'Wallet Connected',
        description:
          result.chainId === X_LAYER_CHAIN_ID
            ? `Connected to ${shortenAddress(result.address)} on OKX X Layer.`
            : `Connected on chain ${result.chainId}. Switch to X Layer (196) for full protection.`,
      });
    } catch (err) {
      set({ isConnecting: false });
      const code = err instanceof Error ? err.message : 'UNKNOWN';
      get().addToast({
        type: 'error',
        title: 'Connection Failed',
        description:
          code === 'NO_WALLET'
            ? 'No Web3 wallet detected. Install OKX Wallet or MetaMask.'
            : code === 'NO_ACCOUNT'
            ? 'No account was authorized.'
            : 'Wallet connection was rejected or failed.',
      });
    }
  },
  disconnectWallet: () => {
    set({ wallet: EMPTY_WALLET, activeTab: 'landing', activeScanResult: null });
    get().addToast({
      type: 'info',
      title: 'Wallet Disconnected',
      description: 'Your session has been safely closed.',
    });
  },
  isConnectModalOpen: false,
  setConnectModalOpen: (open) => set({ isConnectModalOpen: open }),

  currentScanInput: '',
  setCurrentScanInput: (input) => set({ currentScanInput: input }),
  isScanning: false,
  scanProgress: 0,
  scanStage: 'Idle',
  activeScanResult: null,
  scanError: null,

  startScan: async () => {
    const address = get().currentScanInput.trim();
    if (!isValidAddress(address)) {
      set({ scanError: 'Enter a valid 0x contract or wallet address.' });
      get().addToast({
        type: 'error',
        title: 'Invalid Address',
        description: 'Please paste a valid 0x address (42 characters).',
      });
      return;
    }

    set({
      isScanning: true,
      scanProgress: 20,
      scanStage: 'Fetching on-chain bytecode...',
      activeScanResult: null,
      scanError: null,
    });

    try {
      set({ scanProgress: 60, scanStage: 'Analyzing contract code...' });
      const finding = await scanAddress(address);
      const result = buildScanResult(address, finding);

      set({
        isScanning: false,
        scanProgress: 100,
        scanStage: 'Scan Complete',
        activeScanResult: result,
      });

      get().addToast({
        type: result.riskScore >= 40 ? 'warning' : 'success',
        title: 'Scan Finished',
        description: `Risk Score: ${result.riskScore}% (${result.riskLevel})`,
      });
    } catch (err) {
      const code = err instanceof Error ? err.message : 'UNKNOWN';
      set({
        isScanning: false,
        scanProgress: 0,
        scanStage: 'Scan Failed',
        scanError: code === 'NO_WALLET' ? 'Connect a wallet to run a scan.' : 'On-chain scan failed. Try again.',
      });
      get().addToast({
        type: 'error',
        title: 'Scan Failed',
        description: code === 'NO_WALLET' ? 'Connect a wallet first.' : 'Could not read on-chain data.',
      });
    }
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
