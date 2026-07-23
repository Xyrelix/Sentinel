/**
 * api/revoke.ts
 *
 * Constructs an unsigned "revoke approval" transaction for a given
 * token/spender pair - sets the ERC20 allowance back to 0.
 *
 * IMPORTANT: this does NOT sign or broadcast anything. Backend never holds
 * user private keys. It returns the { to, data } needed for the frontend
 * to pass to OKX Wallet for the user to sign and send themselves.
 */

import { encodeFunctionData, isAddress, type Address } from "viem";

const ERC20_APPROVE_ABI = [
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

export interface RevokeRequest {
  tokenAddress: string;
  spenderAddress: string;
}

export interface UnsignedRevokeTransaction {
  to: Address; // the token contract - this is what gets called
  data: `0x${string}`; // encoded approve(spender, 0)
  value: "0x0"; // no native token sent
}

/**
 * Builds the unsigned transaction data to revoke an ERC20 approval
 * (sets allowance to 0). The caller (frontend, via OKX Wallet) is
 * responsible for signing and sending it.
 */
export async function buildRevokeTransaction(
  request: RevokeRequest
): Promise<UnsignedRevokeTransaction> {
  const { tokenAddress, spenderAddress } = request;

  if (!isAddress(tokenAddress, { strict: false })) {
    throw new Error(`Invalid token address: ${tokenAddress}`);
  }
  if (!isAddress(spenderAddress, { strict: false })) {
    throw new Error(`Invalid spender address: ${spenderAddress}`);
  }

  const data = encodeFunctionData({
    abi: ERC20_APPROVE_ABI,
    functionName: "approve",
    args: [spenderAddress as Address, 0n],
  });

  return {
    to: tokenAddress as Address,
    data,
    value: "0x0",
  };
}