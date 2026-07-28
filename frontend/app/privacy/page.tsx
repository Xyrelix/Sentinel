import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | Sentinel",
  description: "How Sentinel collects, uses, and protects your data.",
};

const sections = [
  {
    title: "1. Overview",
    body: `Sentinel is an AI-powered pre-signature transaction scanner for the OKX Wallet on X Layer. This policy explains what data Sentinel collects when you use it, how that data is used, and your choices around it. Sentinel is a hackathon-stage project (OKX.AI Genesis Hackathon) — treat this as an early-stage policy that will evolve as the product matures.`,
  },
  {
    title: "2. Data Sentinel Collects",
    body: `Wallet address: When you connect your OKX Wallet, Sentinel reads your public wallet address to associate scans and reports with your account.

Transaction data: Transactions submitted for scanning (recipient, contract calls, token approvals, value) are analyzed by Sentinel's risk-scoring agents before you sign.

Scan and report history: Sentinel stores a record of past scans, risk scores, and flagged transactions per wallet address in its Supabase database, so you can review your history in the dashboard and reports views.

Usage analytics: Sentinel uses analytics tooling to understand how the app is used (pages visited, features used, general usage patterns). This does not include your private keys, seed phrases, or signed transaction contents beyond what's needed for the scan itself.`,
  },
  {
    title: "3. What Sentinel Never Collects",
    body: `Sentinel never has access to your private keys or seed phrase. All wallet interactions happen through the OKX Wallet SDK using standard read-only and signature-request flows — Sentinel cannot sign or move funds on your behalf.`,
  },
  {
    title: "4. How Sentinel Uses Your Data",
    body: `Data is used to perform pre-signature risk analysis and return a risk score/explanation, to maintain your scan and report history so you can track flagged wallets, contracts, and past activity, to query third-party threat-intelligence sources (e.g. Chainabuse, GoPlus, ENS resolution, phishing-list databases) using relevant transaction/contract identifiers — not your wallet identity — and to improve the product based on aggregate usage analytics.`,
  },
  {
    title: "5. Third-Party Services",
    body: `Sentinel relies on the following third parties, each with their own data practices: Supabase (database hosting), OKX Wallet SDK (wallet connectivity), X Layer RPC providers (on-chain data), and threat-intelligence APIs such as Chainabuse and GoPlus (contract/address risk data). Reviewing their respective privacy policies is recommended.`,
  },
  {
    title: "6. Data Retention",
    body: `Scan and report history tied to your wallet address is retained so the dashboard and reports features continue to work. You can request deletion of your history at any time (see Contact below).`,
  },
  {
    title: "7. Your Choices",
    body: `You can disconnect your wallet at any time, which stops any new activity from being associated with your address. To request access to or deletion of data tied to your wallet address, an issue can be opened on Sentinel's GitHub repository.`,
  },
  {
    title: "8. Changes to This Policy",
    body: `As Sentinel moves from hackathon project toward production, this policy will be updated to reflect new features, storage practices, or third-party integrations. Checking back periodically is recommended.`,
  },
  {
    title: "9. Contact",
    body: `For privacy-related questions, data access, or deletion requests, an issue can be opened on Sentinel's GitHub repository.`,
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-accent">
          Last updated:{" "}
          {new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <div className="space-y-10">
        {sections.map((section) => (
          <section
            key={section.title}
            className="border-b border-[#1E1E1E] pb-8 last:border-0"
          >
            <h2 className="text-lg font-bold text-white mb-3">
              {section.title}
            </h2>
            <div className="text-sm text-accent leading-relaxed whitespace-pre-line">
              {section.body}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-16 pt-8 border-t border-[#1E1E1E]">
        <Link href="/" className="text-sm text-primary hover:underline">
          ← Back to Sentinel
        </Link>
      </div>
    </div>
  );
}
