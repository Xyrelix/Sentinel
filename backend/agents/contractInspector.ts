/**
 * agents/contractInspector.ts
 *
 * First-pass inspection of a transaction's target contract, run before
 * signing. Gathers raw findings (bytecode presence, simulation result,
 * suspicious call patterns) — does NOT assign a risk score itself.
 * riskAnalyzer.ts consumes this output to produce a RiskScore.
 */

import { decodeFunctionData, isAddress, type Address } from "viem";
import {
  getContractInfo,
  simulateTransaction,
  type TransactionRequestInput,
} from "../lib/xlayer/rpcClient";
import type { ContractFlag, ContractInspectionResult } from "@shared/types";
import { isUnlimitedAmount } from "../lib/utils";

// Minimum bytecode size (in bytes) below which we treat a "contract" as
// suspicious — most real ERC20/ERC721 contracts are well over this.
const SUSPICIOUS_BYTECODE_THRESHOLD = 32;

// Minimal ABI fragment for detecting ERC20 approve() calls in tx.data.
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

/**
 * Inspects the target of an unsigned transaction and returns raw findings.
 * Never broadcasts anything — only reads on-chain state and simulates.
 */
export async function inspectContract(
  tx: TransactionRequestInput
): Promise<ContractInspectionResult> {
  if (!isAddress(tx.to, { strict: false })) {
    throw new Error(`Invalid target address: ${tx.to}`);
  }

  const flags: ContractFlag[] = [];

  // 1. Bytecode check
  const contractInfo = await getContractInfo(tx.to as Address);
  if (!contractInfo.isContract) {
    flags.push("not-a-contract");
  } else if (contractInfo.bytecodeSize < SUSPICIOUS_BYTECODE_THRESHOLD) {
    flags.push("empty-bytecode");
  }

  // 2. Simulation check — does the call revert before it's ever signed?
  const simulation = await simulateTransaction(tx);
  if (!simulation.success) {
    flags.push("simulation-reverted");
  }

  // 3. Unlimited-approval detection — decode tx.data if it matches
  // ERC20 approve(spender, amount) and check for max uint256.
  if (tx.data && tx.data !== "0x") {
    try {
      const decoded = decodeFunctionData({
        abi: ERC20_APPROVE_ABI,
        data: tx.data,
      });
      const [, amount] = decoded.args as [Address, bigint];
      if (isUnlimitedAmount(amount)) {
        flags.push("unlimited-approval-requested");
      }
    } catch {
      // tx.data doesn't match approve() — not an error, just not this case.
    }
  }

  return {
    address: tx.to,
    isContract: contractInfo.isContract,
    bytecodeSize: contractInfo.bytecodeSize,
    simulationSucceeded: simulation.success,
    revertReason: simulation.revertReason,
    flags,
  };
}