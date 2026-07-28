import { DocSection } from "@/components/docs/DocSection";

export const metadata = {
  title: "Architecture | Sentinel Docs",
};

const sections = [
  {
    title: "Stack",
    body: `Sentinel's frontend is built with Next.js (App Router), React, TypeScript, and Tailwind CSS. The backend runs as Next.js API routes, with a dedicated agents layer handling AI-driven risk analysis (contract inspection, risk scoring, and scam detection). Data is persisted in Supabase/PostgreSQL, on-chain reads go through X Layer RPC, and wallet connectivity is handled via the OKX Wallet SDK.`,
  },
  {
    title: "Pricing",
    body: `The scan endpoint can optionally be gated behind an x402 micropayment (via the OKX facilitator on X Layer). This is opt-in — it only activates once payment credentials and a payout address are configured on the backend. Until then, scanning remains free.`,
  },
];

export default function DocsArchitecturePage() {
  return sections.map((s) => <DocSection key={s.title} {...s} />);
}
