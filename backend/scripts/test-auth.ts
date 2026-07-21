/**
 * scripts/test-auth.ts
 * Run with: node --env-file=.env.local --import tsx scripts/test-auth.ts
 */

import { startWalletAuth } from "../lib/okx/walletSdk";

async function main() {
  const result = await startWalletAuth(
    "0x000000000000000000000000000000000000dEaD"
  );
  console.log(JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error("Auth start failed:", err);
  process.exit(1);
});