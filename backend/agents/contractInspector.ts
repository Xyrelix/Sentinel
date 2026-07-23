/**
 * agents/contractInspector.ts
 *
 * First-pass inspection of a transaction's target contract, run before
 * signing. Gathers raw findings (bytecode presence, simulation result,
 * suspicious call patterns) - does NOT assign a risk score itself.
 * riskAnalyzer.ts consumes this output to produce a RiskScore.
 */

import { decodeFunctionData, isAddress, type Address } from "viem";
import {
  getContractInfoForChain,
  simulateTransactionForChain,
  isSupportedChain,
  getChainName,
  type TransactionRequestInput,
} from "../lib/rpc/multiChain";
import type { ContractFlag, ContractInspectionResult } from "@shared/types";
import { isUnlimitedAmount } from "../lib/utils";
import { checkAddressSecurity, checkTokenSecurity } from "../lib/goplus";
import { checkChainabuseAddress } from "../lib/chainabuse";

// Minimum bytecode size (in bytes) below which we treat a "contract" as
// suspicious - most real ERC20/ERC721 contracts are well over this.
const SUSPICIOUS_BYTECODE_THRESHOLD = 32;

const DEFAULT_CHAIN_ID = 196; // X Layer - this app's main/default chain.

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
 * Never broadcasts anything - only reads on-chain state and simulates.
 *
 * Multichain: bytecode/simulation checks now run against whichever chain
 * chainId identifies (defaults to X Layer), using lib/rpc/multiChain.ts's
 * registry of public RPC endpoints. If a chain isn't in that registry,
 * on-chain checks are skipped gracefully (noted in externalFindings) rather
 * than failing the whole scan - GoPlus/Chainabuse threat-intel, which cover
 * far more chains than we have our own RPC access to, still run normally.
 */
export async function inspectContract(
  tx: TransactionRequestInput,
  chainIdInput?: string | number
): Promise<ContractInspectionResult> {
  if (!isAddress(tx.to, { strict: false })) {
    throw new Error(`Invalid target address: ${tx.to}`);
  }

  const chainId = Number(chainIdInput) || DEFAULT_CHAIN_ID;
  const flags: ContractFlag[] = [];
  const externalFindings: string[] = [];

  // A bare address/domain lookup (no real calldata or value) isn't an actual
  // pending transaction - it's just "is this thing safe?". Both checks below
  // that depend on an intended interaction (not-a-contract, simulation) only
  // count as risk signals when there's a real payload to judge; otherwise
  // they misfire constantly (every plain wallet is "not a contract", and
  // probing a real contract's fallback with empty calldata/0 value reverts
  // for most legitimate contracts - e.g. USDT has no payable fallback).
  const hasRealPayload = Boolean(tx.data && tx.data !== "0x") || Boolean(tx.value && tx.value > 0n);

  let contractInfo = { isContract: false, bytecodeSize: 0 };
  let simulation: { success: boolean; revertReason?: string } = { success: true };

  if (isSupportedChain(chainId)) {
    // 1. Bytecode check - always run for informational value (isContract/
    // bytecodeSize are returned either way), but "not-a-contract" is only a
    // risk flag when a real interaction was actually attempted against it.
    contractInfo = await getContractInfoForChain(tx.to as Address, chainId);
    if (!contractInfo.isContract) {
      if (hasRealPayload) {
        flags.push("not-a-contract");
      }
    } else if (contractInfo.bytecodeSize < SUSPICIOUS_BYTECODE_THRESHOLD) {
      flags.push("empty-bytecode");
    }

    // 2. Simulation check - does the call revert before it's ever signed?
    // Only meaningful with a real payload; there's nothing to simulate for
    // a bare lookup, and an empty-calldata probe reverting proves nothing.
    if (hasRealPayload) {
      simulation = await simulateTransactionForChain(tx, chainId);
      if (!simulation.success) {
        flags.push("simulation-reverted");
      }
    }
  } else {
    externalFindings.push(
      `On-chain bytecode and simulation checks were skipped - no RPC endpoint configured for ${getChainName(chainId)} (chain ${chainId}).`
    );
  }

  // 3. Unlimited-approval detection - decode tx.data if it matches
  // ERC20 approve(spender, amount) and check for max uint256. Chain-agnostic
  // - just decodes the calldata itself, no RPC needed.
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
      // tx.data doesn't match approve() - not an error, just not this case.
    }
  }

  // 4. Real-world threat intelligence via GoPlus Security - best-effort.
  // GoPlus downtime or rate-limiting should never break a scan; on failure
  // we simply proceed without this signal.
  try {
    const addressCheck = await checkAddressSecurity(tx.to, chainId);
    if (addressCheck.isMalicious) {
      flags.push("goplus-malicious-address");
      externalFindings.push(...addressCheck.reasons);
    }
  } catch {
    // best-effort - ignore
  }

  if (contractInfo.isContract) {
    try {
      const tokenCheck = await checkTokenSecurity(tx.to, chainId);
      if (tokenCheck.isHoneypot) {
        flags.push("goplus-honeypot-token");
        externalFindings.push(...tokenCheck.reasons);
      }
    } catch {
      // best-effort - ignore
    }
  }

  // 5. Chainabuse community-reported scam database - a second, independent
  // address-reputation source alongside GoPlus. No-ops (never throws) when
  // CHAINABUSE_API_KEY isn't configured, so this is purely additive.
  try {
    const chainabuseCheck = await checkChainabuseAddress(tx.to);
    if (chainabuseCheck.isReported) {
      flags.push("chainabuse-reported-address");
      externalFindings.push(...chainabuseCheck.reasons);
    }
  } catch {
    // best-effort - ignore
  }

  return {
    address: tx.to,
    isContract: contractInfo.isContract,
    bytecodeSize: contractInfo.bytecodeSize,
    simulationSucceeded: simulation.success,
    revertReason: simulation.revertReason,
    flags,
    externalFindings: externalFindings.length ? externalFindings : undefined,
  };
}
