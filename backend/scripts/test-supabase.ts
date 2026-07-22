/**
 * scripts/test-supabase.ts
 * Manual smoke test - run with:
 *   node --env-file=.env.local --import tsx scripts/test-supabase.ts
 */

import { getWatchedPairs } from "../lib/db/supabase";

async function main() {
  const pairs = await getWatchedPairs();
  console.log(JSON.stringify(pairs, null, 2));
}

main().catch((err) => {
  console.error("Fetch failed:", err);
  process.exit(1);
});