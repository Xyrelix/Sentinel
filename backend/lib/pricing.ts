/**
 * lib/pricing.ts
 *
 * Server-side native-token USD pricing via CoinGecko. Uses COINGECKO_API_KEY
 * (a free "Demo" tier key) when set - the fully public, unauthenticated
 * CoinGecko endpoint has low rate limits and fails intermittently under load;
 * a Demo key raises those limits substantially. This must run server-side
 * only - the key would be exposed in the client bundle if called from the
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

// CoinGecko "asset platform" ids, used by the per-token (contract-address)
// price endpoint - distinct from the native-coin ids above. Verified live
// against CoinGecko's /asset_platforms list for chain 196 ("x-layer",
// chain_identifier 196); the rest are CoinGecko's well-documented standard
// platform ids for these chains.
const ASSET_PLATFORM_IDS: Record<number, string> = {
  1: "ethereum",
  10: "optimistic-ethereum",
  56: "binance-smart-chain",
  137: "polygon-pos",
  8453: "base",
  42161: "arbitrum-one",
  43114: "avalanche",
  196: "x-layer",
};

/**
 * Fetches the live USD price of a specific ERC20 token by contract address.
 * Only chains in ASSET_PLATFORM_IDS are supported. Throws on failure or an
 * unpriced token (CoinGecko's coverage of smaller/obscure tokens is
 * incomplete, especially on X Layer) - callers should treat this as
 * best-effort, same as getNativeTokenPriceUsd.
 */
export async function getTokenPriceUsd(chainId: number, contractAddress: string): Promise<number> {
  const platform = ASSET_PLATFORM_IDS[chainId];
  if (!platform) {
    throw new Error(`No CoinGecko asset platform mapping for chain ${chainId}`);
  }

  const headers: Record<string, string> = {};
  if (process.env.COINGECKO_API_KEY) {
    headers["x-cg-demo-api-key"] = process.env.COINGECKO_API_KEY;
  }

  const res = await fetch(
    `https://api.coingecko.com/api/v3/simple/token_price/${platform}?contract_addresses=${contractAddress}&vs_currencies=usd`,
    { headers }
  );
  if (!res.ok) {
    throw new Error(`CoinGecko token price request failed with status ${res.status}`);
  }

  const data = await res.json();
  const price = data?.[contractAddress.toLowerCase()]?.usd;
  if (typeof price !== "number") {
    throw new Error(`CoinGecko has no price data for token ${contractAddress} on chain ${chainId}`);
  }
  return price;
}

/** Fetches the live USD price of a chain's native token. Throws on failure - callers should treat this as best-effort. */
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
