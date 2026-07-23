/**
 * lib/utils.ts
 *
 * Generic helpers shared across api/, agents/, and lib/. No blockchain
 * or database imports here - keep this file dependency-free so anything
 * can import from it without pulling in RPC clients or DB connections.
 */

/**
 * Type guard / runtime check for a bigint representing "unlimited"
 * (max uint256) - used wherever we need to flag infinite approvals
 * without re-declaring the constant in every file.
 */
export const MAX_UINT256 = 2n ** 256n - 1n;

export function isUnlimitedAmount(amount: bigint): boolean {
  return amount === MAX_UINT256;
}

/**
 * Loose check for "this looks like a domain, not a blockchain address" -
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

/**
 * Checks for an ENS name (vitalik.eth) - checked before isLikelyDomain in
 * api/scan.ts, since a .eth name would otherwise match that domain-shape
 * regex too and get misrouted to the phishing-site pipeline instead of
 * being resolved to a real address and scanned properly.
 */
export function isEnsName(value: string): boolean {
  return /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*\.eth$/i.test(value.trim());
}