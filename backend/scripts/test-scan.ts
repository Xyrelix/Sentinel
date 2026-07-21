/**
 * scripts/test-scan.ts
 * Manual smoke test — run with:
 *   node --env-file=.env.local --import tsx scripts/test-scan.ts
 */

import { scanTransaction } from "../agents/scamDetectionAgent";

async function main() {
  // Swap these for real addresses on X Layer testnet to test against.
  const result = await scanTransaction({
    from: "0x000000000000000000000000000000000000dEaD",
    to: "0x000000000000000000000000000000000000dEaD", // try a real contract too
    data: "0x",
    value: 0n,
  });

  console.log(JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error("Scan failed:", err);
  process.exit(1);
});