/**
 * lib/goplus.ts
 *
 * Real-world threat intelligence via GoPlus Security's public API - flags
 * addresses already known to the community as malicious (phishing,
 * blackmail, money laundering, etc.) and tokens with honeypot/scam-tax
 * characteristics. The public endpoints work with no key at all (verified
 * live); GOPLUS_API_KEY, if set, is sent as a bearer token for higher rate
 * limits - never required for correctness, only for throughput.
 */

const GOPLUS_BASE = "https://api.gopluslabs.io/api/v1";

// X Layer Mainnet is the default/main chain for this app, but every
// GoPlus check below accepts an explicit chainId so callers can check
// whatever chain is actually relevant (e.g. the connected wallet's current
// chain) - GoPlus supports dozens of chains (Ethereum, BSC, Polygon, Base,
// Arbitrum, etc.), this was never a GoPlus limitation, just an unnecessary
// hardcode here.
export const DEFAULT_CHAIN_ID = "196";

function authHeaders(): Record<string, string> {
  return process.env.GOPLUS_API_KEY ? { Authorization: `Bearer ${process.env.GOPLUS_API_KEY}` } : {};
}

export interface AddressSecurityResult {
  isMalicious: boolean;
  reasons: string[];
}

const ADDRESS_FLAG_LABELS: Record<string, string> = {
  phishing_activities: "GoPlus: flagged for phishing activity.",
  blackmail_activities: "GoPlus: flagged for blackmail activity.",
  cybercrime: "GoPlus: flagged for cybercrime.",
  money_laundering: "GoPlus: flagged for money laundering.",
  financial_crime: "GoPlus: flagged for financial crime.",
  stealing_attack: "GoPlus: flagged for theft/stealing attacks.",
  fake_kyc: "GoPlus: flagged for fake KYC.",
  sanctioned: "GoPlus: this address is sanctioned.",
  mixer: "GoPlus: associated with a mixing service.",
  darkweb_transactions: "GoPlus: associated with dark web transactions.",
  fake_token: "GoPlus: associated with fake tokens.",
  honeypot_related_address: "GoPlus: associated with honeypot contracts.",
};

/** Checks an address against GoPlus's aggregated malicious-address intelligence for the given chain (defaults to X Layer). Throws on request failure - best-effort, callers should catch. */
export async function checkAddressSecurity(
  address: string,
  chainId: string | number = DEFAULT_CHAIN_ID
): Promise<AddressSecurityResult> {
  const res = await fetch(
    `${GOPLUS_BASE}/address_security/${address}?chain_id=${chainId}`,
    { headers: authHeaders() }
  );
  if (!res.ok) {
    throw new Error(`GoPlus address_security request failed with status ${res.status}`);
  }

  const data = await res.json();
  const result = data?.result ?? {};

  const reasons = Object.entries(ADDRESS_FLAG_LABELS)
    .filter(([key]) => result[key] === "1")
    .map(([, label]) => label);

  return { isMalicious: reasons.length > 0, reasons };
}

export interface TokenSecurityResult {
  isHoneypot: boolean;
  reasons: string[];
}

const HIGH_TAX_THRESHOLD = 0.15;

/** Checks a token contract against GoPlus's token-security analysis (honeypot, tax, mint, hidden owner) for the given chain (defaults to X Layer). Throws on request failure - best-effort, callers should catch. */
export async function checkTokenSecurity(
  address: string,
  chainId: string | number = DEFAULT_CHAIN_ID
): Promise<TokenSecurityResult> {
  const res = await fetch(
    `${GOPLUS_BASE}/token_security/${chainId}?contract_addresses=${address}`,
    { headers: authHeaders() }
  );
  if (!res.ok) {
    throw new Error(`GoPlus token_security request failed with status ${res.status}`);
  }

  const data = await res.json();
  const info = data?.result?.[address.toLowerCase()];
  if (!info) return { isHoneypot: false, reasons: [] };

  const reasons: string[] = [];
  if (info.is_honeypot === "1") reasons.push("GoPlus: this token is flagged as a honeypot (can buy, can't sell).");
  if (info.cannot_sell_all === "1") reasons.push("GoPlus: holders cannot sell their full balance.");
  if (info.is_mintable === "1") reasons.push("GoPlus: contract has an active mint function (supply can be inflated).");
  if (info.hidden_owner === "1") reasons.push("GoPlus: contract has a hidden owner.");
  if (info.selfdestruct === "1") reasons.push("GoPlus: contract can self-destruct.");

  const buyTax = Number(info.buy_tax ?? 0);
  const sellTax = Number(info.sell_tax ?? 0);
  if (buyTax > HIGH_TAX_THRESHOLD) reasons.push(`GoPlus: high buy tax (${(buyTax * 100).toFixed(1)}%).`);
  if (sellTax > HIGH_TAX_THRESHOLD) reasons.push(`GoPlus: high sell tax (${(sellTax * 100).toFixed(1)}%).`);

  return { isHoneypot: reasons.length > 0, reasons };
}

export interface PhishingSiteResult {
  isPhishing: boolean;
  reasons: string[];
}

/** Checks a domain/URL against GoPlus's phishing-site database. Throws on request failure - best-effort, callers should catch. */
export async function checkPhishingSite(url: string): Promise<PhishingSiteResult> {
  const res = await fetch(`${GOPLUS_BASE}/phishing_site?url=${encodeURIComponent(url)}`, {
    headers: authHeaders(),
  });
  if (!res.ok) {
    throw new Error(`GoPlus phishing_site request failed with status ${res.status}`);
  }

  const data = await res.json();
  const isPhishing = data?.result?.phishing_site === 1;

  return {
    isPhishing,
    reasons: isPhishing ? ["GoPlus: this domain is flagged as a known phishing site."] : [],
  };
}
