import { DocSection } from "@/components/docs/DocSection";

export const metadata = {
  title: "Features | Sentinel Docs",
};

const sections = [
  {
    title: "AI Scanner",
    body: `The Scanner view analyzes a pending transaction before it's signed. It inspects the target contract, requested permissions, and transaction parameters, then returns a risk score alongside a plain-English breakdown of what the transaction actually does. Flagged transactions are logged to the wallet's report history for later review.`,
  },
  {
    title: "Wallet Health",
    body: `Wallet Health gives a broader view of a connected wallet's exposure — active token approvals, interactions with previously flagged contracts, and general risk posture across past activity.`,
  },
  {
    title: "Approvals Manager",
    body: `The Approvals view lists active token approvals granted by the connected wallet and allows revoking approvals that are no longer needed or that appear risky, reducing exposure to draining exploits that rely on stale permissions.`,
  },
  {
    title: "Threat Intel",
    body: `The Threat Intel view surfaces community and third-party threat data — including known phishing addresses and flagged contracts — sourced from providers such as Chainabuse and GoPlus, combined with ENS resolution and phishing-list databases. Community-submitted reports are unverified — category and severity are set by the reporter, not by AI analysis.`,
  },
];

export default function DocsFeaturesPage() {
  return sections.map((s) => <DocSection key={s.title} {...s} />);
}
