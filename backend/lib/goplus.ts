/**
 * lib/goplus.ts
 *
 * Real-world threat intelligence via GoPlus Security's public API — flags
 * addresses already known to the community as malicious (phishing,
 * blackmail, money laundering, etc.) and tokens with honeypot/scam-tax
 * characteristics. The public endpoints work with no key at all (verified
 * live); GOPLUS_API_KEY, if set, is sent as a bearer token for higher rate
 * limits — never required for correctness, only for throughput.
 */

const GOPLUS_BASE = "https://api.gopluslabs.io/api/v1";

// GoPlus only tracks X Layer Mainnet (chain id 196) — used for threat-intel
// lookups regardless of which X Layer network (main/test) the rest of the
// scan pipeline reads bytecode from, since real-world scam intelligence is
// inherently about mainnet activity.
const GOPLUS_XLAYER_CHAIN_ID = "196";

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

/** Checks an address against GoPlus's aggregated malicious-address intelligence. Throws on request failure — best-effort, callers should catch. */
export async function checkAddressSecurity(address: string): Promise<AddressSecurityResult> {
  const res = await fetch(
    `${GOPLUS_BASE}/address_security/${address}?chain_id=${GOPLUS_XLAYER_CHAIN_ID}`,
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

/** Checks a token contract against GoPlus's token-security analysis (honeypot, tax, mint, hidden owner). Throws on request failure — best-effort, callers should catch. */
export async function checkTokenSecurity(address: string): Promise<TokenSecurityResult> {
  const res = await fetch(
    `${GOPLUS_BASE}/token_security/${GOPLUS_XLAYER_CHAIN_ID}?contract_addresses=${address}`,
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
