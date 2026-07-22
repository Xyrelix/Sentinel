/**
 * lib/ens.ts
 *
 * Resolves ENS names (vitalik.eth) to their registered Ethereum address via
 * ENSIdeas's public resolution API (no key needed, verified live). ENS
 * itself only exists on Ethereum mainnet, so this always resolves against
 * mainnet regardless of which chain the resolved address is then scanned
 * against - a "wallet name" is a mainnet-registered pointer to an address,
 * not a per-chain concept.
 */

const ENS_RESOLVE_BASE = "https://api.ensideas.com/ens/resolve";

/**
 * Resolves a .eth name to its registered address.
 * Returns null if the name isn't registered (not an error - confirmed live:
 * ENSIdeas returns 200 with address: null for unregistered names).
 * Throws only on a genuine request failure - callers should catch.
 */
export async function resolveEnsName(name: string): Promise<string | null> {
  const res = await fetch(`${ENS_RESOLVE_BASE}/${encodeURIComponent(name)}`);
  if (!res.ok) {
    throw new Error(`ENS resolution request failed with status ${res.status}`);
  }
  const data = await res.json();
  return data?.address ?? null;
}
