import { getWalletHealth } from "../api/walletHealth";

async function main() {
  // Use any valid-format address — approvals will just come back empty/zero
  // unless it's a real wallet with actual on-chain approvals against your
  // watched pairs.
  const result = await getWalletHealth("0x000000000000000000000000000000000000dEaD");
  console.log(JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error("Wallet health check failed:", err);
  process.exit(1);
});