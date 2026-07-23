/// <reference path="../types/eth-phishing-detect.d.ts" />
/**
 * lib/phishingList.ts
 *
 * MetaMask's community-maintained phishing-domain blocklist
 * (eth-phishing-detect) - a second, independent phishing-domain source
 * alongside GoPlus's phishing_site check, so a domain flagged by either
 * provider gets caught. The npm package bundles a config.json snapshot
 * frozen at install time (goes stale); this fetches the live,
 * continuously-updated list from MetaMask's GitHub repo instead, falling
 * back to the bundled snapshot only if that fetch fails.
 */

import PhishingDetector from "eth-phishing-detect/src/detector";
import fallbackConfig from "eth-phishing-detect/src/config.json";

const LIVE_CONFIG_URL = "https://raw.githubusercontent.com/MetaMask/eth-phishing-detect/main/src/config.json";

let detectorPromise: Promise<PhishingDetector> | null = null;

async function getDetector(): Promise<PhishingDetector> {
  if (!detectorPromise) {
    detectorPromise = (async () => {
      try {
        const res = await fetch(LIVE_CONFIG_URL);
        if (!res.ok) throw new Error(`status ${res.status}`);
        const config = await res.json();
        return new PhishingDetector(config);
      } catch {
        // Live fetch failed (network issue, GitHub rate limit, etc.) - fall
        // back to the bundled snapshot rather than skipping the check entirely.
        return new PhishingDetector(fallbackConfig);
      }
    })();
  }
  return detectorPromise;
}

export interface PhishingListResult {
  isPhishing: boolean;
  reason?: string;
}

/** Checks a domain against MetaMask's eth-phishing-detect blocklist (exact, allowlist, and fuzzy/typosquat matching). */
export async function checkEthPhishingList(domain: string): Promise<PhishingListResult> {
  const detector = await getDetector();
  const { result, type } = detector.check(domain);
  return {
    isPhishing: result,
    reason: result ? `MetaMask eth-phishing-detect: flagged (${type} match).` : undefined,
  };
}
