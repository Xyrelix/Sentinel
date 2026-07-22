import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { NavTab, WalletState, ScanResult, ApprovalItem, ThreatAlert, ToastMessage } from '../types/sentinel';
import type { TokenApproval } from '@shared/types';
import {
  connect as web3Connect,
  scanAddress,
  signMessage,
  sendTransaction,
  formatEther,
  shortenAddress,
  isValidAddress,
  getNativeTokenPriceUsd,
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
  isVerified: false,
};

const MAX_UINT256_STR = (2n ** 256n - 1n).toString();

// Preset Scans for Instant Simulation — quick demo scenarios (Dashboard shortcuts,
// Scanner preset buttons). Freeform addresses always go through the real on-chain
// scanAddress() below instead.
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

function findingToRiskLevel(finding: ScanFinding): ScanResult['riskLevel'] {
  if (finding.score >= 60) return 'CRITICAL';
  if (finding.score >= 40) return 'HIGH';
  if (finding.score >= 25) return 'MEDIUM';
  if (finding.score > 0) return 'LOW';
  return 'SAFE';
}

function buildRealScanResult(address: string, finding: ScanFinding): ScanResult {
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

function riskLabelToLevel(label: string): ScanResult['riskLevel'] {
  if (label === 'high-risk') return 'CRITICAL';
  if (label === 'caution') return 'MEDIUM';
  return 'SAFE';
}

// Builds a ScanResult from the real backend pipeline (backend/agents/scamDetectionAgent.ts
// via /api/scan) — richer than the client-only check: includes simulation and
// unlimited-approval-request detection, not just bytecode presence/size.
function buildResultFromRiskScore(
  address: string,
  risk: { score: number; label: string; reasons: string[] }
): ScanResult {
  const safe = risk.label === 'safe';
  return {
    id: `scan-${address.toLowerCase()}`,
    targetAddress: address,
    targetName: 'On-Chain Target (Backend Pipeline)',
    network: 'OKX X Layer',
    riskScore: risk.score,
    riskLevel: riskLabelToLevel(risk.label),
    estimatedValueUsd: 0,
    gasFeeEth: 0,
    timestamp: 'Just now',
    checks: risk.reasons.map((reason, idx) => ({
      id: `r${idx}`,
      label: `Backend Finding ${idx + 1}`,
      status: safe ? 'passed' : 'failed',
      details: reason,
    })),
    aiExplanation: {
      whatWeFound: risk.reasons.join(' '),
      whyItMatters: safe
        ? 'No high-risk code patterns, failed simulations, or unlimited-approval requests were detected by the backend pipeline.'
        : 'The backend pipeline (bytecode inspection + transaction simulation + approval-request analysis) flagged this transaction.',
      potentialImpact: safe
        ? 'Standard interaction risk applies. Always verify the source of any transaction.'
        : 'Interacting with or signing this transaction could put your funds at risk.',
      recommendedAction: safe
        ? 'Proceed with normal caution and verify the dApp source.'
        : 'Avoid signing this transaction until it is verified safe.',
    },
  };
}

// Maps the backend's WalletHealth.approvals (real on-chain allowances against the
// Supabase-backed watchlist) into the UI's ApprovalItem shape.
function mapTokenApprovalToItem(a: TokenApproval, index: number): ApprovalItem {
  const unlimited = a.amount === MAX_UINT256_STR;
  return {
    id: `${a.token}-${a.spender}-${index}`,
    tokenSymbol: shortenAddress(a.token),
    tokenName: a.label ?? 'ERC-20 Token',
    tokenAddress: a.token,
    allowance: unlimited ? 'Unlimited' : a.amount,
    isUnlimited: unlimited,
    spenderAddress: a.spender,
    spenderName: a.label ?? shortenAddress(a.spender),
    riskLevel: unlimited ? 'CRITICAL' : 'LOW',
    valueAtRiskUsd: 0,
    protocol: a.label ?? 'Watched Spender',
    lastUpdated: 'Just now',
  };
}

// Derives a 0-100 risk score (higher = riskier) from the real wallet-health
// response — unlimited approvals are the dominant signal, other flags
// (e.g. a bad watchlist row, zero balance) add a smaller penalty each.
function computeOverallRiskScore(approvals: ApprovalItem[], riskFlags: string[]): number {
  const unlimitedCount = approvals.filter((a) => a.isUnlimited).length;
  const penalty = unlimitedCount * 30 + riskFlags.length * 10;
  return Math.max(0, Math.min(100, penalty));
}

interface SentinelStore {
  // Navigation
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;

  // Custom Cursor toggle
  customCursorEnabled: boolean;
  setCustomCursorEnabled: (enabled: boolean) => void;

  // Wallet State
  wallet: WalletState;
  isConnecting: boolean;
  connectWallet: (walletId?: string) => Promise<void>;
  disconnectWallet: () => void;
  isConnectModalOpen: boolean;
  setConnectModalOpen: (open: boolean) => void;
  verifyWalletOwnership: () => Promise<void>;
  refreshBalanceUsd: () => Promise<void>;

  // Scanner State
  currentScanInput: string;
  setCurrentScanInput: (input: string) => void;
  isScanning: boolean;
  scanProgress: number; // 0 to 100
  scanStage: string;
  activeScanResult: ScanResult | null;
  scanError: string | null;
  startScan: (presetKey?: string) => void;

  // Approvals State
  approvals: ApprovalItem[];
  approvalRiskFlags: string[];
  approvalsLoading: boolean;
  approvalsError: string | null;
  fetchApprovals: () => Promise<void>;
  revokeApproval: (id: string) => Promise<void>;

  // Threat Alerts
  threats: ThreatAlert[];
  threatsLoading: boolean;
  threatsError: string | null;
  fetchThreats: () => Promise<void>;
  addThreatReport: (threat: Omit<ThreatAlert, 'id' | 'timestamp' | 'upvotes'>) => Promise<void>;

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

export const useSentinelStore = create<SentinelStore>()(
  persist(
    (set, get) => ({
  activeTab: 'landing',
  setActiveTab: (tab) => set({ activeTab: tab }),

  customCursorEnabled: false,
  setCustomCursorEnabled: (enabled) => set({ customCursorEnabled: enabled }),

  wallet: EMPTY_WALLET,
  isConnecting: false,
  connectWallet: async (walletId) => {
    if (get().isConnecting) return;
    set({ isConnecting: true });
    try {
      const result = await web3Connect(walletId);
      set({
        wallet: {
          isConnected: true,
          address: result.address,
          network: result.chainId === X_LAYER_CHAIN_ID ? 'OKX X Layer' : `Chain ${result.chainId}`,
          chainId: result.chainId,
          balanceEth: Number(formatEther(result.balanceWei, 6)),
          balanceUsd: 0,
          overallRiskScore: 0,
          isVerified: false,
        },
        isConnectModalOpen: false,
        isConnecting: false,
      });
      get().addToast({
        type: result.chainId === X_LAYER_CHAIN_ID ? 'success' : 'warning',
        title: 'Wallet Connected',
        description:
          result.chainId === X_LAYER_CHAIN_ID
            ? `Connected securely to ${shortenAddress(result.address)} on OKX X Layer.`
            : `Connected on chain ${result.chainId}. Switch to X Layer (196) for full protection.`,
      });

      // Best-effort background flows — none of these should block wallet connection.
      get().verifyWalletOwnership();
      get().fetchApprovals();
      get().refreshBalanceUsd();
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

  verifyWalletOwnership: async () => {
    const wallet = get().wallet;
    if (!wallet.isConnected) return;
    try {
      const nonceRes = await fetch('/api/auth/nonce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: wallet.address }),
      });
      const nonceData = await nonceRes.json();
      if (!nonceRes.ok) throw new Error(nonceData.error ?? 'Failed to start wallet auth.');

      const signature = await signMessage(wallet.address, nonceData.message);

      const verifyRes = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: wallet.address,
          nonce: nonceData.nonce,
          message: nonceData.message,
          signature,
        }),
      });
      const { verified } = await verifyRes.json();

      set((state) => ({ wallet: { ...state.wallet, isVerified: Boolean(verified) } }));
      if (verified) {
        get().addToast({
          type: 'success',
          title: 'Wallet Verified',
          description: 'Signature verified — ownership confirmed with replay protection.',
        });
      }
    } catch {
      // Best-effort only — a missing Supabase/RPC config or a rejected signature
      // should never block using the rest of the app.
    }
  },

  refreshBalanceUsd: async () => {
    const wallet = get().wallet;
    if (!wallet.isConnected || wallet.chainId === undefined) return;
    try {
      const price = await getNativeTokenPriceUsd(wallet.chainId);
      set((state) => ({
        wallet: { ...state.wallet, balanceUsd: state.wallet.balanceEth * price },
      }));
    } catch {
      // Best-effort — CoinGecko rate limits/downtime shouldn't break the app;
      // balanceUsd just stays at its last known value (0 if never fetched).
    }
  },

  currentScanInput: '0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5',
  setCurrentScanInput: (input) => set({ currentScanInput: input }),
  isScanning: false,
  scanProgress: 0,
  scanStage: 'Idle',
  activeScanResult: null,
  scanError: null,

  startScan: (presetKey) => {
    // Preset demo scenarios (Dashboard shortcuts, Scanner quick-test buttons) —
    // instant, scripted results for showcasing the UI without needing a live
    // malicious contract on hand.
    if (presetKey && PRESET_SCANS[presetKey]) {
      const chosenPreset = PRESET_SCANS[presetKey];

      set({
        isScanning: true,
        scanProgress: 5,
        scanStage: 'Fetching Contract Bytecode & ABI...',
        activeScanResult: null,
        scanError: null,
      });

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

      return;
    }

    // Freeform input — run a real on-chain inspection via the connected wallet.
    (async () => {
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

      // Prefer the real backend pipeline (bytecode + simulation + unlimited-approval
      // detection) — falls back to a direct wallet-RPC check if the backend isn't
      // reachable/configured (e.g. no X_LAYER_RPC_URL set).
      try {
        set({ scanProgress: 50, scanStage: 'Running backend AI risk pipeline...' });
        const wallet = get().wallet;
        const res = await fetch('/api/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ from: wallet.address || undefined, to: address }),
        });

        if (res.ok) {
          const risk = await res.json();
          set({ scanProgress: 90, scanStage: 'Generating Plain-English Risk Report...' });
          const result = buildResultFromRiskScore(address, risk);
          set({ isScanning: false, scanProgress: 100, scanStage: 'Scan Complete', activeScanResult: result });
          get().addToast({
            type: result.riskScore >= 40 ? 'warning' : 'success',
            title: 'Scan Finished',
            description: `Risk Score: ${result.riskScore}% (${result.riskLevel})`,
          });
          return;
        }
        throw new Error('Backend scan unavailable');
      } catch {
        // fall through to client-side check below
      }

      try {
        set({ scanProgress: 60, scanStage: 'Analyzing contract code directly via wallet RPC...' });
        const finding = await scanAddress(address);
        const result = buildRealScanResult(address, finding);

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
    })();
  },

  approvals: [],
  approvalRiskFlags: [],
  approvalsLoading: false,
  approvalsError: null,
  fetchApprovals: async () => {
    const wallet = get().wallet;
    if (!wallet.isConnected || !wallet.address) return;

    set({ approvalsLoading: true, approvalsError: null });
    try {
      const res = await fetch(`/api/wallet-health?address=${wallet.address}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to check wallet health.');

      const approvals: ApprovalItem[] = (data.approvals ?? []).map(
        (a: TokenApproval, idx: number) => mapTokenApprovalToItem(a, idx)
      );
      const riskFlags: string[] = data.riskFlags ?? [];
      set((state) => ({
        approvals,
        approvalRiskFlags: riskFlags,
        approvalsLoading: false,
        wallet: { ...state.wallet, overallRiskScore: computeOverallRiskScore(approvals, riskFlags) },
      }));
    } catch (err) {
      set({
        approvalsLoading: false,
        approvalsError: err instanceof Error ? err.message : 'Failed to load approvals.',
      });
    }
  },
  revokeApproval: async (id) => {
    const target = get().approvals.find((a) => a.id === id);
    if (!target) return;

    if (!target.tokenAddress) {
      get().addToast({
        type: 'error',
        title: 'Cannot Revoke',
        description: 'Missing token contract address for this approval.',
      });
      return;
    }

    const wallet = get().wallet;
    if (!wallet.isConnected) {
      get().addToast({ type: 'error', title: 'Revoke Failed', description: 'Connect a wallet first.' });
      return;
    }

    try {
      const buildRes = await fetch('/api/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenAddress: target.tokenAddress, spenderAddress: target.spenderAddress }),
      });
      const tx = await buildRes.json();
      if (!buildRes.ok) throw new Error(tx.error ?? 'Failed to build revoke transaction.');

      const hash = await sendTransaction(wallet.address, tx);

      set((state) => ({ approvals: state.approvals.filter((a) => a.id !== id) }));
      get().addToast({
        type: 'success',
        title: 'Revoke Submitted',
        description: `Tx ${hash.slice(0, 10)}… revoking ${target.tokenSymbol} for ${target.spenderName}.`,
      });
    } catch (err) {
      const code = err instanceof Error ? err.message : 'UNKNOWN';
      get().addToast({
        type: 'error',
        title: 'Revoke Failed',
        description: code === 'NO_WALLET' ? 'Connect a wallet first.' : code,
      });
    }
  },

  threats: [],
  threatsLoading: false,
  threatsError: null,
  fetchThreats: async () => {
    set({ threatsLoading: true, threatsError: null });
    try {
      const res = await fetch('/api/threat-intel');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to load threat reports.');
      set({ threats: data.threats ?? [], threatsLoading: false });
    } catch (err) {
      set({
        threatsLoading: false,
        threatsError: err instanceof Error ? err.message : 'Failed to load threat reports.',
      });
    }
  },
  addThreatReport: async (newThreat) => {
    try {
      const res = await fetch('/api/threat-intel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newThreat),
      });
      const item = await res.json();
      if (!res.ok) throw new Error(item.error ?? 'Failed to submit threat report.');

      set((state) => ({ threats: [item, ...state.threats] }));
      get().addToast({
        type: 'success',
        title: 'Scam Report Submitted',
        description: 'Thank you for protecting the Web3 community!',
      });
    } catch (err) {
      get().addToast({
        type: 'error',
        title: 'Report Failed',
        description: err instanceof Error ? err.message : 'Could not submit report.',
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
    }),
    {
      name: 'sentinel-settings',
      // Only persist actual user preferences — wallet/scan/approvals/threats
      // state should always re-derive from a real connection, never be
      // faked back in from a stale localStorage snapshot.
      partialize: (state) => ({
        customCursorEnabled: state.customCursorEnabled,
        autoScanEnabled: state.autoScanEnabled,
        riskThreshold: state.riskThreshold,
      }),
    }
  )
);
