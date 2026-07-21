import { scanTransaction as runScamDetection } from "../agents/scamDetectionAgent";
import type { TransactionRequestInput } from "../lib/xlayer/rpcClient";

export async function scanTransaction(tx: TransactionRequestInput) {
  return runScamDetection(tx);
}
