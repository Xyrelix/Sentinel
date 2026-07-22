/**
 * lib/okx/walletSdk.ts
 *
 * Backend-side wallet verification. Does NOT connect to wallets, prompt
 * signatures, or hold keys - that's 100% frontend, via OKX Wallet's
 * browser SDK. This file's job: issue a nonce, build the message to sign,
 * and verify the returned signature - with replay protection via
 * lib/db/supabase.ts's auth_nonces table.
 */

import { isAddress, type Address } from "viem";
import { getXLayerClient } from "../xlayer/rpcClient";
import { createNonce, consumeNonce } from "../db/supabase";

export interface SignatureVerificationRequest {
  address: string;
  nonce: string;
  message: string;
  signature: `0x${string}`;
}

/**
 * Step 1 of the auth flow - call this first. Generates a fresh, stored
 * nonce and returns the exact message the frontend should have the user
 * sign via OKX Wallet.
 */
export async function startWalletAuth(address: string): Promise<{
  message: string;
  nonce: string;
}> {
  if (!isAddress(address, { strict: false })) {
    throw new Error(`Invalid wallet address: ${address}`);
  }

  const nonce = await createNonce(address);
  const message = [
    "Sign this message to verify wallet ownership for Sentinel.",
    `Address: ${address}`,
    `Nonce: ${nonce}`,
  ].join("\n");

  return { message, nonce };
}

/**
 * Step 2 of the auth flow - verifies the signature AND consumes the nonce
 * atomically. Returns false (never throws) on any failure - malformed
 * input, expired/reused nonce, or a signature that doesn't match. Callers
 * should treat any false as "reject the request."
 */
export async function verifyWalletSignature(
  request: SignatureVerificationRequest
): Promise<boolean> {
  const { address, nonce, message, signature } = request;

  if (!isAddress(address, { strict: false })) {
    return false;
  }

  const nonceValid = await consumeNonce(nonce, address);
  if (!nonceValid) return false;

  try {
    const client = getXLayerClient();
    return await client.verifyMessage({
      address: address as Address,
      message,
      signature,
    });
  } catch {
    return false;
  }
}