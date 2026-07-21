/**
 * scripts/test-revoke.ts
 * Manual smoke test — run with:
 *   node --env-file=.env.local --import tsx scripts/test-revoke.ts
 */

import { buildRevokeTransaction } from "../api/revoke";

async function main() {
  const tx = await buildRevokeTransaction({
    tokenAddress: "0x1234567890123456789012345678901234567890",
    spenderAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
  });
  console.log(JSON.stringify(tx, null, 2));
}

main().catch((err) => {
  console.error("Revoke build failed:", err);
  process.exit(1);
});