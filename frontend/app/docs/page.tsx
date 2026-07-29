import { DocSection } from "@/components/docs/DocSection";

export const metadata = {
  title: "Documentation | Sentinel",
  description: "How Sentinel works and how to use it.",
};

const sections = [
  {
    title: "What Sentinel Does",
    body: `Sentinel is an AI-powered pre-signature transaction scanner built for the OKX Wallet on X Layer. Before a transaction is signed, Sentinel analyzes it for scam patterns, malicious contract behavior, and wallet-draining exploits, then surfaces a plain-English risk explanation so the decision to sign stays informed.`,
  },
  {
    title: "Getting Started",
    body: `Connect an OKX Wallet using the "Connect Wallet" button in the navbar. Once connected, Sentinel unlocks the Dashboard, AI Scanner, Wallet Health, Approvals, and Threat Intel views. No account creation or email is required — access is tied to the connected wallet address.`,
  },
];

export default function DocsOverviewPage() {
  return sections.map((s) => <DocSection key={s.title} {...s} />);
}
