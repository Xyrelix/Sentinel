import Link from "next/link";

export const metadata = {
  title: "Terms of Service | Sentinel",
  description: "Terms governing your use of Sentinel.",
};

const sections = [
  {
    title: "1. Acceptance of Terms",
    body: `By accessing or using Sentinel ("the app", "the service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the service. Sentinel is provided as a hackathon-stage project (OKX.AI Genesis Hackathon) and these terms may change as the product evolves.`,
  },
  {
    title: "2. Description of Service",
    body: `Sentinel is an AI-powered pre-signature transaction scanner for the OKX Wallet on X Layer. It analyzes pending transactions and flags potential scam patterns, contract risk, and wallet-draining exploits before you sign. Sentinel provides risk information only — it does not execute, approve, or sign transactions on your behalf.`,
  },
  {
    title: "3. Not Financial or Legal Advice",
    body: `Risk scores, warnings, and explanations provided by Sentinel are informational only and do not constitute financial, legal, or investment advice. Sentinel is a decision-support tool, not a guarantee of safety. You are solely responsible for reviewing and deciding whether to sign any transaction.`,
  },
  {
    title: "4. No Warranty",
    body: `Sentinel is provided "as is" and "as available," without warranties of any kind, express or implied. We do not guarantee that risk analysis will be accurate, complete, or catch every scam, exploit, or malicious contract. Threat intelligence relies in part on third-party data sources (e.g. Chainabuse, GoPlus, ENS, phishing-list databases) which may themselves be incomplete or delayed.`,
  },
  {
    title: "5. Limitation of Liability",
    body: `To the fullest extent permitted by law, Sentinel and its contributors are not liable for any loss of funds, assets, or data resulting from transactions you choose to sign or reject, including losses arising from undetected scams, contract exploits, or inaccurate risk assessments. Use of Sentinel does not shift responsibility for on-chain activity away from you.`,
  },
  {
    title: "6. Wallet Security",
    body: `Sentinel connects to your OKX Wallet using standard read and signature-request flows via the OKX Wallet SDK. We never have access to your private keys or seed phrase, and we cannot move funds without your explicit signature. You remain solely responsible for securing your wallet credentials.`,
  },
  {
    title: "7. Your Data",
    body: `Your wallet address and associated scan/report history are stored to power the dashboard and reports features. See our Privacy Policy for full details on data collection and use.`,
  },
  {
    title: "8. Prohibited Use",
    body: `You agree not to use Sentinel to facilitate illegal activity, attempt to reverse-engineer or disrupt the scanning infrastructure, or misrepresent Sentinel's risk output for fraudulent purposes.`,
  },
  {
    title: "9. Intellectual Property",
    body: `Sentinel's codebase, branding, and design are the property of their respective contributors. The project source is available on GitHub; refer to the repository's license for terms governing use, modification, and distribution of the code itself.`,
  },
  {
    title: "10. Termination",
    body: `We reserve the right to suspend or restrict access to Sentinel, in whole or in part, at any time — particularly during this hackathon/early-stage phase where uptime and continuity are not guaranteed.`,
  },
  {
    title: "11. Changes to These Terms",
    body: `As Sentinel moves from hackathon project toward production, these terms will be updated to reflect new features or legal requirements. Continued use of the service after changes constitutes acceptance of the updated terms.`,
  },
  {
    title: "12. Contact",
    body: `For questions about these terms, please open an issue on our GitHub repository.`,
  },
];

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
          Terms of Service
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
