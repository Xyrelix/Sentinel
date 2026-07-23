/**
 * lib/x402Server.ts
 *
 * Shared x402ResourceServer singleton for payment-protected routes. Talks
 * to OKX's facilitator on X Layer (the only chain @okxweb3/x402-evm
 * currently supports) via HMAC-signed API credentials from OKX's developer
 * portal - these are account credentials, not something to hardcode or
 * guess, so this throws clearly if unset rather than silently no-opping.
 */

import { x402ResourceServer } from "@okxweb3/x402-core/server";
import { OKXFacilitatorClient } from "@okxweb3/x402-core";
import { ExactEvmScheme } from "@okxweb3/x402-evm/exact/server";

const X_LAYER_NETWORK = "eip155:196";

let server: x402ResourceServer | null = null;

export function getX402ResourceServer(): x402ResourceServer {
  if (server) return server;

  const apiKey = process.env.OKX_X402_API_KEY;
  const secretKey = process.env.OKX_X402_SECRET_KEY;
  const passphrase = process.env.OKX_X402_PASSPHRASE;

  if (!apiKey || !secretKey || !passphrase) {
    throw new Error(
      "OKX_X402_API_KEY, OKX_X402_SECRET_KEY, and OKX_X402_PASSPHRASE must be set to accept x402 payments (get these from the OKX developer portal)."
    );
  }

  const facilitatorClient = new OKXFacilitatorClient({ apiKey, secretKey, passphrase });
  server = new x402ResourceServer(facilitatorClient).register(X_LAYER_NETWORK, new ExactEvmScheme());
  return server;
}

export function getX402PayToAddress(): string {
  const payTo = process.env.X402_PAYTO_ADDRESS;
  if (!payTo) {
    throw new Error("X402_PAYTO_ADDRESS must be set to the wallet address that should receive x402 payments.");
  }
  return payTo;
}

/**
 * Reads the per-call price for a given route's env var (e.g.
 * X402_SCAN_PRICE_USD), falling back to defaultUsd. Keeping this
 * configurable means the on-chain ASP listing's fee and what this endpoint
 * actually charges can be kept in sync without a code change.
 */
export function getX402PriceUsd(envVar: string, defaultUsd: string): string {
  const raw = process.env[envVar];
  return `$${raw ?? defaultUsd}`;
}

export { X_LAYER_NETWORK };
