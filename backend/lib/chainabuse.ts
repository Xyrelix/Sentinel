/**
 * lib/chainabuse.ts
 *
 * Chainabuse's community-reported scam-address database - a second,
 * independent address-reputation source alongside GoPlus's address_security
 * check, so an address reported to either community gets caught. Requires
 * CHAINABUSE_API_KEY (confirmed live: the endpoint returns 401 "Invalid
 * credentials" with no key at all, unlike GoPlus's free public tier) - if
 * the key isn't set, checkChainabuseAddress() is skipped entirely rather
 * than failing every scan.
 *
 * NOTE: Chainabuse's own docs (docs.chainabuse.com/reference/reports-1)
 * describe Basic auth, but this uses the Bearer scheme as given - worth
 * re-verifying against a real key once one is available, in case the docs
 * page is stale/wrong for this specific key type.
 */

const CHAINABUSE_BASE = "https://api.chainabuse.com/v0";

export interface AddressReportResult {
  isReported: boolean;
  reportCount: number;
  reasons: string[];
}

/**
 * Checks an address against Chainabuse's community-reported scam database.
 * Returns { isReported: false, reportCount: 0, reasons: [] } (not an error)
 * when CHAINABUSE_API_KEY isn't configured - this check is opt-in.
 * Throws on a genuine request failure - callers should catch, same as the
 * GoPlus checks.
 */
export async function checkChainabuseAddress(address: string): Promise<AddressReportResult> {
  const apiKey = process.env.CHAINABUSE_API_KEY;
  if (!apiKey) {
    return { isReported: false, reportCount: 0, reasons: [] };
  }

  const res = await fetch(`${CHAINABUSE_BASE}/reports?address=${encodeURIComponent(address)}`, {
    headers: {
      accept: "application/json",
      authorization: `Bearer ${apiKey}`,
    },
  });
  if (!res.ok) {
    throw new Error(`Chainabuse request failed with status ${res.status}`);
  }

  const data = await res.json();
  // Defensive parsing - the exact response shape isn't confirmed against a
  // real key yet, so handle the plausible shapes (bare array, or wrapped in
  // a data/results field) rather than assuming one.
  const reports: unknown[] = Array.isArray(data) ? data : data?.data ?? data?.results ?? [];

  const reasons = reports.slice(0, 5).map((report) => {
    const r = report as Record<string, unknown>;
    const category = (r.category as string) ?? (r.type as string) ?? "reported activity";
    return `Chainabuse: reported for ${category}.`;
  });

  return { isReported: reports.length > 0, reportCount: reports.length, reasons };
}
