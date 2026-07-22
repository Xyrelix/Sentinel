/**
 * lib/pricing.ts
 *
 * Server-side native-token USD pricing via CoinGecko. Uses COINGECKO_API_KEY
 * (a free "Demo" tier key) when set — the fully public, unauthenticated
 * CoinGecko endpoint has low rate limits and fails intermittently under load;
 * a Demo key raises those limits substantially. This must run server-side
 * only — the key would be exposed in the client bundle if called from the
 * browser, which is why frontend/lib/web3.ts calls /api/price instead of
 * hitting CoinGecko directly.
 */

const COINGECKO_IDS: Record<number, string> = {
  1: "ethereum",
  10: "ethereum",
  8453: "ethereum",
  42161: "ethereum",
  59144: "ethereum",
  534352: "ethereum",
  56: "binancecoin",
  137: "matic-network",
  43114: "avalanche-2",
  195: "okb",
  196: "okb",
};

export function getCoingeckoId(chainId: number): string {
  return COINGECKO_IDS[chainId] ?? "ethereum";
}

/** Fetches the live USD price of a chain's native token. Throws on failure — callers should treat this as best-effort. */
export async function getNativeTokenPriceUsd(chainId: number): Promise<number> {
  const id = getCoingeckoId(chainId);
  const headers: Record<string, string> = {};
  if (process.env.COINGECKO_API_KEY) {
    headers["x-cg-demo-api-key"] = process.env.COINGECKO_API_KEY;
  }

  const res = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`,
    { headers }
  );
  if (!res.ok) {
    throw new Error(`CoinGecko request failed with status ${res.status}`);
  }

  const data = await res.json();
  const price = data?.[id]?.usd;
  if (typeof price !== "number") {
    throw new Error("CoinGecko response missing price data.");
  }
  return price;
}
