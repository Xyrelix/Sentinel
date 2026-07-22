import { Eip1193Provider } from '../types/ethereum';
import PhishingDetector from 'eth-phishing-detect/src/detector';

export const X_LAYER_CHAIN_ID = 196;

export type ContractFlag =
  | 'not-a-contract'
  | 'empty-bytecode'
  | 'goplus-malicious-address'
  | 'goplus-honeypot-token';

// ---------------------------------------------------------------------------
// Chain metadata (multichain - not restricted to X Layer)
// ---------------------------------------------------------------------------

interface ChainMeta {
  name: string;
  symbol: string;
}

const CHAINS: Record<number, ChainMeta> = {
  1: { name: 'Ethereum', symbol: 'ETH' },
  10: { name: 'Optimism', symbol: 'ETH' },
  56: { name: 'BNB Chain', symbol: 'BNB' },
  137: { name: 'Polygon', symbol: 'POL' },
  8453: { name: 'Base', symbol: 'ETH' },
  42161: { name: 'Arbitrum One', symbol: 'ETH' },
  43114: { name: 'Avalanche', symbol: 'AVAX' },
  59144: { name: 'Linea', symbol: 'ETH' },
  534352: { name: 'Scroll', symbol: 'ETH' },
  195: { name: 'X Layer Testnet', symbol: 'OKB' },
  196: { name: 'OKX X Layer', symbol: 'OKB' },
};

export function getChainMeta(chainId: number): ChainMeta {
  return CHAINS[chainId] ?? { name: `Chain ${chainId}`, symbol: 'ETH' };
}

// ---------------------------------------------------------------------------
// Live native-token price
// ---------------------------------------------------------------------------
//
// Goes through our own /api/price route rather than calling CoinGecko
// directly - the CoinGecko API key (raises rate limits above the public
// anonymous tier) lives server-side only and must never reach the browser
// bundle.

/** Fetches the live USD price of a chain's native token via /api/price. Throws on failure - callers should treat this as best-effort. */
export async function getNativeTokenPriceUsd(chainId: number): Promise<number> {
  const res = await fetch(`/api/price?chainId=${chainId}`);
  if (!res.ok) throw new Error('PRICE_FETCH_FAILED');
  const data = await res.json();
  if (typeof data?.price !== 'number') throw new Error('PRICE_FETCH_FAILED');
  return data.price;
}

// ---------------------------------------------------------------------------
// Multi-wallet discovery (EIP-6963 + legacy injected fallbacks)
// ---------------------------------------------------------------------------

export interface WalletOption {
  id: string; // rdns (EIP-6963) or synthetic id
  name: string;
  icon?: string;
  provider: Eip1193Provider;
}

interface Eip6963ProviderDetail {
  info: { uuid: string; name: string; icon: string; rdns: string };
  provider: Eip1193Provider;
}

const discovered = new Map<string, WalletOption>();

function initDiscovery() {
  if (typeof window === 'undefined') return;
  window.addEventListener('eip6963:announceProvider', (event: Event) => {
    const detail = (event as CustomEvent<Eip6963ProviderDetail>).detail;
    if (!detail?.info || !detail?.provider) return;
    discovered.set(detail.info.rdns, {
      id: detail.info.rdns,
      name: detail.info.name,
      icon: detail.info.icon,
      provider: detail.provider,
    });
  });
  window.dispatchEvent(new Event('eip6963:requestProvider'));
}
initDiscovery();

// Wallets we want to surface even if the extension isn't installed, so users
// see the option and get an install link.
export const KNOWN_WALLETS: { id: string; name: string; installUrl: string }[] = [
  { id: 'com.okex.wallet', name: 'OKX Wallet', installUrl: 'https://www.okx.com/web3' },
  { id: 'io.metamask', name: 'MetaMask', installUrl: 'https://metamask.io/download/' },
  { id: 'com.coinbase.wallet', name: 'Coinbase Wallet', installUrl: 'https://www.coinbase.com/wallet/downloads' },
];

/** Returns installed injected wallets, discovered via EIP-6963 + legacy globals. */
export function getAvailableWallets(): WalletOption[] {
  // Re-request in case wallets announced after initial load.
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('eip6963:requestProvider'));
  }

  const list = [...discovered.values()];
  const has = (re: RegExp) => list.some((w) => re.test(w.name));

  if (typeof window !== 'undefined') {
    // OKX exposes a dedicated global; add if EIP-6963 didn't already surface it.
    if (window.okxwallet && !has(/okx/i)) {
      list.push({ id: 'com.okex.wallet', name: 'OKX Wallet', provider: window.okxwallet });
    }
    // Generic injected provider fallback (older wallets without EIP-6963).
    if (window.ethereum && list.length === 0) {
      const name = window.ethereum.isOKXWallet
        ? 'OKX Wallet'
        : window.ethereum.isMetaMask
        ? 'MetaMask'
        : 'Browser Wallet';
      list.push({ id: 'injected', name, provider: window.ethereum });
    }
  }

  return list;
}

// ---------------------------------------------------------------------------
// Active provider + connection
// ---------------------------------------------------------------------------

let activeProvider: Eip1193Provider | null = null;

function resolveProvider(walletId?: string): Eip1193Provider | null {
  const wallets = getAvailableWallets();
  if (walletId) {
    const match = wallets.find((w) => w.id === walletId);
    if (match) return match.provider;
  }
  // Prefer OKX, then any available, then legacy globals.
  const okx = wallets.find((w) => /okx/i.test(w.name));
  if (okx) return okx.provider;
  if (wallets[0]) return wallets[0].provider;
  if (typeof window !== 'undefined') return window.okxwallet ?? window.ethereum ?? null;
  return null;
}

export interface ConnectedWallet {
  address: string;
  chainId: number;
  balanceWei: bigint;
  walletName: string;
}

export async function connect(walletId?: string): Promise<ConnectedWallet> {
  const provider = resolveProvider(walletId);
  if (!provider) throw new Error('NO_WALLET');

  const accounts = await provider.request<string[]>({ method: 'eth_requestAccounts' });
  const address = accounts?.[0];
  if (!address) throw new Error('NO_ACCOUNT');

  const [chainIdHex, balanceHex] = await Promise.all([
    provider.request<string>({ method: 'eth_chainId' }),
    provider.request<string>({ method: 'eth_getBalance', params: [address, 'latest'] }),
  ]);

  activeProvider = provider;

  const wallets = getAvailableWallets();
  const walletName = wallets.find((w) => w.provider === provider)?.name ?? 'Wallet';

  return {
    address,
    chainId: parseInt(chainIdHex, 16),
    balanceWei: BigInt(balanceHex),
    walletName,
  };
}

/** Attach account/chain change listeners to the active provider. */
export function bindWalletEvents(handlers: {
  onAccountsChanged: (accounts: string[]) => void;
  onChainChanged: (chainId: number) => void;
}): void {
  if (!activeProvider?.on) return;
  activeProvider.on('accountsChanged', (...args: unknown[]) => {
    handlers.onAccountsChanged((args[0] as string[]) ?? []);
  });
  activeProvider.on('chainChanged', (...args: unknown[]) => {
    handlers.onChainChanged(parseInt(args[0] as string, 16));
  });
}

export function clearActiveProvider(): void {
  activeProvider = null;
}

export function getInjectedProvider(): Eip1193Provider | null {
  return activeProvider ?? resolveProvider();
}

export async function refreshBalance(address: string): Promise<bigint> {
  const provider = getInjectedProvider();
  if (!provider) throw new Error('NO_WALLET');
  const balanceHex = await provider.request<string>({
    method: 'eth_getBalance',
    params: [address, 'latest'],
  });
  return BigInt(balanceHex);
}

/** Signs a plain-text message with `personal_sign` - used for the nonce-based auth handshake. */
export async function signMessage(address: string, message: string): Promise<`0x${string}`> {
  const provider = getInjectedProvider();
  if (!provider) throw new Error('NO_WALLET');
  const bytes = new TextEncoder().encode(message);
  const hexMessage = (`0x` +
    Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')) as `0x${string}`;
  return provider.request<`0x${string}`>({
    method: 'personal_sign',
    params: [hexMessage, address],
  });
}

export interface UnsignedTx {
  to: string;
  data: `0x${string}`;
  value?: string;
}

/** Sends a prebuilt unsigned transaction via the connected wallet and returns the tx hash. */
export async function sendTransaction(from: string, tx: UnsignedTx): Promise<`0x${string}`> {
  const provider = getInjectedProvider();
  if (!provider) throw new Error('NO_WALLET');
  return provider.request<`0x${string}`>({
    method: 'eth_sendTransaction',
    params: [{ from, to: tx.to, data: tx.data, value: tx.value ?? '0x0' }],
  });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function isValidAddress(value: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(value.trim());
}

/** Loose check for "this looks like a domain, not an address" - strips a protocol/path if present. */
export function isValidDomain(value: string): boolean {
  const trimmed = value.trim().toLowerCase();
  if (isValidAddress(trimmed)) return false;
  const stripped = trimmed.replace(/^https?:\/\//, '').split('/')[0];
  return /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/.test(stripped);
}

export function formatEther(wei: bigint, decimals = 4): string {
  const negative = wei < 0n;
  const abs = negative ? -wei : wei;
  const whole = abs / 10n ** 18n;
  const frac = abs % 10n ** 18n;
  const fracStr = frac.toString().padStart(18, '0').slice(0, decimals).replace(/0+$/, '');
  const out = fracStr ? `${whole}.${fracStr}` : `${whole}`;
  return negative ? `-${out}` : out;
}

export function shortenAddress(address: string): string {
  if (!isValidAddress(address)) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// ---------------------------------------------------------------------------
// GoPlus Security - client-side fallback checks
// ---------------------------------------------------------------------------
//
// Same real-world threat intel as backend/lib/goplus.ts, called directly
// from the browser for the client-only fallback path (used when /api/scan
// is unreachable). GoPlus's public endpoints work with no key at all
// (verified live) - only GOPLUS_API_KEY (higher rate limits) stays
// server-side; the underlying checks work here regardless.

const GOPLUS_BASE = 'https://api.gopluslabs.io/api/v1';
// X Layer is this app's default/main chain, but every check below takes an
// explicit chainId - GoPlus supports dozens of chains, so scanAddress()
// passes whatever chain the connected wallet is actually on.
export const GOPLUS_DEFAULT_CHAIN_ID = X_LAYER_CHAIN_ID;

async function checkGoPlusAddress(address: string, chainId: number = GOPLUS_DEFAULT_CHAIN_ID): Promise<string[]> {
  const flagLabels: Record<string, string> = {
    phishing_activities: 'GoPlus: flagged for phishing activity.',
    blackmail_activities: 'GoPlus: flagged for blackmail activity.',
    cybercrime: 'GoPlus: flagged for cybercrime.',
    money_laundering: 'GoPlus: flagged for money laundering.',
    financial_crime: 'GoPlus: flagged for financial crime.',
    stealing_attack: 'GoPlus: flagged for theft/stealing attacks.',
    sanctioned: 'GoPlus: this address is sanctioned.',
    mixer: 'GoPlus: associated with a mixing service.',
    honeypot_related_address: 'GoPlus: associated with honeypot contracts.',
  };
  const res = await fetch(`${GOPLUS_BASE}/address_security/${address}?chain_id=${chainId}`);
  if (!res.ok) throw new Error('GOPLUS_REQUEST_FAILED');
  const data = await res.json();
  const result = data?.result ?? {};
  return Object.entries(flagLabels)
    .filter(([key]) => result[key] === '1')
    .map(([, label]) => label);
}

async function checkGoPlusToken(address: string, chainId: number = GOPLUS_DEFAULT_CHAIN_ID): Promise<string[]> {
  const res = await fetch(`${GOPLUS_BASE}/token_security/${chainId}?contract_addresses=${address}`);
  if (!res.ok) throw new Error('GOPLUS_REQUEST_FAILED');
  const data = await res.json();
  const info = data?.result?.[address.toLowerCase()];
  if (!info) return [];

  const reasons: string[] = [];
  if (info.is_honeypot === '1') reasons.push("GoPlus: this token is flagged as a honeypot (can buy, can't sell).");
  if (info.cannot_sell_all === '1') reasons.push('GoPlus: holders cannot sell their full balance.');
  if (info.hidden_owner === '1') reasons.push('GoPlus: contract has a hidden owner.');
  const sellTax = Number(info.sell_tax ?? 0);
  if (sellTax > 0.15) reasons.push(`GoPlus: high sell tax (${(sellTax * 100).toFixed(1)}%).`);
  return reasons;
}

/** Checks a domain/URL against GoPlus's phishing-site database - no wallet or RPC needed. */
export async function checkPhishingSiteClient(domain: string): Promise<{ isPhishing: boolean; reasons: string[] }> {
  const res = await fetch(`${GOPLUS_BASE}/phishing_site?url=${encodeURIComponent(domain)}`);
  if (!res.ok) throw new Error('GOPLUS_REQUEST_FAILED');
  const data = await res.json();
  const isPhishing = data?.result?.phishing_site === 1;
  return {
    isPhishing,
    reasons: isPhishing ? ['GoPlus: this domain is flagged as a known phishing site.'] : [],
  };
}

// MetaMask's eth-phishing-detect - a second, independent phishing-domain
// source. Fetches the live, continuously-updated list from GitHub (the
// bundled npm config.json is a static install-time snapshot that goes
// stale) - falls back to that bundled snapshot only if the live fetch fails.
const ETH_PHISHING_LIVE_CONFIG_URL =
  'https://raw.githubusercontent.com/MetaMask/eth-phishing-detect/main/src/config.json';
let ethPhishingDetectorPromise: Promise<PhishingDetector> | null = null;

async function getEthPhishingDetector(): Promise<PhishingDetector> {
  if (!ethPhishingDetectorPromise) {
    ethPhishingDetectorPromise = (async () => {
      try {
        const res = await fetch(ETH_PHISHING_LIVE_CONFIG_URL);
        if (!res.ok) throw new Error(`status ${res.status}`);
        const config = await res.json();
        return new PhishingDetector(config);
      } catch {
        // Dynamic import - code-split so this ~370KB fallback snapshot is
        // only ever downloaded on the rare path where the live fetch fails,
        // not bundled into every page load.
        const fallbackModule = await import('eth-phishing-detect/src/config.json');
        return new PhishingDetector((fallbackModule as { default?: unknown }).default ?? fallbackModule);
      }
    })();
  }
  return ethPhishingDetectorPromise;
}

/** Checks a domain against MetaMask's eth-phishing-detect blocklist - no wallet or RPC needed. */
export async function checkEthPhishingListClient(
  domain: string
): Promise<{ isPhishing: boolean; reason?: string }> {
  const detector = await getEthPhishingDetector();
  const { result, type } = detector.check(domain);
  return {
    isPhishing: result,
    reason: result ? `MetaMask eth-phishing-detect: flagged (${type} match).` : undefined,
  };
}

// ---------------------------------------------------------------------------
// On-chain scan
// ---------------------------------------------------------------------------

const SUSPICIOUS_BYTECODE_THRESHOLD = 32;

const FLAG_WEIGHTS: Record<ContractFlag, number> = {
  'not-a-contract': 60,
  'empty-bytecode': 35,
  'goplus-malicious-address': 85,
  'goplus-honeypot-token': 80,
};

const FLAG_REASONS: Record<ContractFlag, string> = {
  'not-a-contract':
    "The target address has no contract code - it's a regular wallet, not the token or dApp it may claim to be.",
  'empty-bytecode':
    "The contract's code is unusually small for what it claims to do - a common sign of a hastily deployed scam contract.",
  'goplus-malicious-address':
    'This address matches known malicious activity in GoPlus Security real-world threat intelligence.',
  'goplus-honeypot-token':
    "GoPlus Security's token analysis flagged this contract with honeypot or scam-tax characteristics.",
};

export interface ScanFinding {
  score: number;
  label: 'safe' | 'caution' | 'high-risk';
  isContract: boolean;
  bytecodeSize: number;
  flags: ContractFlag[];
  reasons: string[];
}

function scoreToLabel(score: number): ScanFinding['label'] {
  if (score >= 60) return 'high-risk';
  if (score >= 25) return 'caution';
  return 'safe';
}

// Reads live on-chain state via the connected provider and derives an honest
// risk finding, enriched with GoPlus real-world threat intel (best-effort -
// GoPlus downtime never breaks a scan). No indexer - only what an RPC node
// and GoPlus's public API know. Works across whatever chain the wallet is
// actually connected to, not just X Layer - both the bytecode read and the
// GoPlus checks use the wallet's current chain.
export async function scanAddress(address: string): Promise<ScanFinding> {
  const provider = getInjectedProvider();
  if (!provider) throw new Error('NO_WALLET');
  if (!isValidAddress(address)) throw new Error('INVALID_ADDRESS');

  const flags: ContractFlag[] = [];
  const externalReasons: string[] = [];

  const [bytecode, chainIdHex] = await Promise.all([
    provider.request<string>({ method: 'eth_getCode', params: [address, 'latest'] }),
    provider.request<string>({ method: 'eth_chainId' }),
  ]);
  const chainId = parseInt(chainIdHex, 16);
  const isContract = Boolean(bytecode && bytecode !== '0x');
  const bytecodeSize = isContract ? (bytecode.length - 2) / 2 : 0;

  if (!isContract) {
    flags.push('not-a-contract');
  } else if (bytecodeSize < SUSPICIOUS_BYTECODE_THRESHOLD) {
    flags.push('empty-bytecode');
  }

  try {
    const addressFindings = await checkGoPlusAddress(address, chainId);
    if (addressFindings.length > 0) {
      flags.push('goplus-malicious-address');
      externalReasons.push(...addressFindings);
    }
  } catch {
    // best-effort - ignore
  }

  if (isContract) {
    try {
      const tokenFindings = await checkGoPlusToken(address, chainId);
      if (tokenFindings.length > 0) {
        flags.push('goplus-honeypot-token');
        externalReasons.push(...tokenFindings);
      }
    } catch {
      // best-effort - ignore
    }
  }

  const reasons: string[] = [];
  let score = 0;
  for (const flag of flags) {
    score += FLAG_WEIGHTS[flag];
    reasons.push(FLAG_REASONS[flag]);
  }
  reasons.push(...externalReasons);
  score = Math.min(score, 100);
  if (reasons.length === 0) {
    reasons.push('No known risk patterns detected from on-chain code inspection.');
  }

  return { score, label: scoreToLabel(score), isContract, bytecodeSize, flags, reasons };
}

export interface DomainScanFinding {
  score: number;
  label: 'safe' | 'caution' | 'high-risk';
  isPhishing: boolean;
  reasons: string[];
}

/**
 * Checks a domain against two independent phishing-domain sources - GoPlus
 * and MetaMask's eth-phishing-detect. No wallet or RPC needed - works even
 * when disconnected. Each source is best-effort - one being down doesn't
 * block the other from still catching a match.
 */
export async function scanDomain(domain: string): Promise<DomainScanFinding> {
  const reasons: string[] = [];
  let isPhishing = false;

  try {
    const goPlusResult = await checkPhishingSiteClient(domain);
    if (goPlusResult.isPhishing) {
      isPhishing = true;
      reasons.push(...goPlusResult.reasons);
    }
  } catch {
    // best-effort - ignore
  }

  try {
    const metaMaskResult = await checkEthPhishingListClient(domain);
    if (metaMaskResult.isPhishing) {
      isPhishing = true;
      if (metaMaskResult.reason) reasons.push(metaMaskResult.reason);
    }
  } catch {
    // best-effort - ignore
  }

  if (isPhishing) {
    return { score: 95, label: 'high-risk', isPhishing, reasons };
  }
  return {
    score: 0,
    label: 'safe',
    isPhishing,
    reasons: ["No known phishing reports for this domain in GoPlus Security or MetaMask's eth-phishing-detect list."],
  };
}
