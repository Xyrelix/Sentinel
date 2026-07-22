/**
 * lib/utils.ts
 *
 * Generic helpers shared across api/, agents/, and lib/. No blockchain
 * or database imports here — keep this file dependency-free so anything
 * can import from it without pulling in RPC clients or DB connections.
 */

/**
 * Shortens an address for display: 0x1234...abcd
 * Used anywhere a full 42-char address would clutter the UI/logs.
 */
export function formatAddress(address: string): string {
  if (address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Converts a bigint token amount (base units) into a human-readable
 * decimal string, given the token's decimals (e.g. 18 for most ERC20s).
 * Kept string-based rather than Number to avoid precision loss on large
 * balances/allowances.
 */
export function formatTokenAmount(amount: bigint, decimals: number): string {
  const divisor = 10n ** BigInt(decimals);
  const whole = amount / divisor;
  const fraction = amount % divisor;

  if (fraction === 0n) return whole.toString();

  const fractionStr = fraction
    .toString()
    .padStart(decimals, "0")
    .replace(/0+$/, ""); // trim trailing zeros

  return `${whole}.${fractionStr}`;
}

/**
 * Type guard / runtime check for a bigint representing "unlimited"
 * (max uint256) — used wherever we need to flag infinite approvals
 * without re-declaring the constant in every file.
 */
export const MAX_UINT256 = 2n ** 256n - 1n;

export function isUnlimitedAmount(amount: bigint): boolean {
  return amount === MAX_UINT256;
}

/**
 * Simple sleep helper — useful for retry/backoff logic against RPC calls
 * that hit rate limits (X Layer's public RPC is capped at 100 req/s/IP).
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Loose check for "this looks like a domain, not a blockchain address" —
 * used by api/scan.ts to route between the address pipeline
 * (contractInspector.ts) and the domain/phishing-site pipeline
 * (scamDetectionAgent.ts's scanDomain). Strips a protocol/path if present.
 */
export function isLikelyDomain(value: string): boolean {
  const trimmed = value.trim().toLowerCase();
  if (trimmed.startsWith("0x")) return false;
  const stripped = trimmed.replace(/^https?:\/\//, "").split("/")[0];
  return /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/.test(stripped);
}