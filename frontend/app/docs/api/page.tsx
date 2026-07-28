import Link from "next/link";

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
  {
    title: "Architecture",
    body: `Sentinel's frontend is built with Next.js (App Router), React, TypeScript, and Tailwind CSS. The backend runs as Next.js API routes, with a dedicated agents layer handling AI-driven risk analysis (contract inspection, risk scoring, and scam detection). Data is persisted in Supabase/PostgreSQL, on-chain reads go through X Layer RPC, and wallet connectivity is handled via the OKX Wallet SDK.`,
  },
  {
    title: "API Overview",
    body: `Sentinel exposes a small set of internal API routes consumed by the frontend:`,
    code: `POST /api/scan            Analyze a transaction, address, ENS name, or domain
GET  /api/wallet-health   Check wallet approvals, exposure, and risk scores (?address=0x...)
GET  /api/threat-intel    List community-submitted threat reports
POST /api/threat-intel    Submit a community threat report
POST /api/revoke          Build an unsigned approval-revoke transaction
GET  /api/price           Fetch a chain's native token price in USD (?chainId=196)`,
  },
  {
    title: "POST /api/scan",
    body: `Runs a pre-signature risk scan. Sentinel routes the request based on the shape of the target:

- ENS name (e.g. "vitalik.eth") — resolved to an address before scanning, with the resolution noted in the response reasons.
- Domain (e.g. a website URL) — routed to phishing-site detection instead of transaction analysis.
- Contract/wallet address or raw transaction — analyzed directly for risk.

Request body:`,
    code: `{
  "to": "0x... | ENS name | domain",   // required
  "from": "0x...",                     // optional, defaults to a burn address
  "data": "0x...",                     // optional calldata
  "value": "0",                        // optional, wei as string
  "chainId": 196                       // optional
}`,
  },
  {
    title: "Response — POST /api/scan",
    body: `Returns a risk score and label, plus supporting reasons. If an ENS name was resolved, the resolved address is included.`,
    code: `{
  "score": 0-100,
  "label": "...",
  "reasons": ["..."],
  "resolvedAddress": "0x..." // present only if input was an ENS name
}

// Error responses
400  { "error": "to (target address, ENS name, or domain) is required." }
404  { "error": "Could not resolve ENS name \\"...\\"" }
500  { "error": "Scan failed." }`,
  },
  {
    title: "Pricing",
    body: `The scan endpoint can optionally be gated behind an x402 micropayment (via the OKX facilitator on X Layer). This is opt-in — it only activates once payment credentials and a payout address are configured on the backend. Until then, scanning remains free.`,
  },
  {
    title: "GET /api/wallet-health",
    body: `Checks a wallet's token approvals against Sentinel's watchlist and returns a full risk summary, without ever signing or sending anything — it only reads on-chain state.

Query parameters:`,
    code: `GET /api/wallet-health?address=0x...`,
  },
  {
    title: "What It Checks",
    body: `For each token/spender pair on Sentinel's watchlist, the wallet's current allowance is checked on-chain. Any nonzero approval is returned; unlimited approvals are flagged as a risk. The wallet's native OKB balance is also checked (a zero balance is flagged as informational, not a security risk).

Three headline scores are computed from this same data:

Unlimited Approval Exposure (USD) — for each unlimited approval, Sentinel prices the wallet's live token balance (not the approved amount, since that's often effectively infinite) via CoinGecko and sums the drainable USD value. Tokens without a listed price are excluded from the total and noted once in riskFlags.

Contract Safety Score — every unique spender the wallet has approved is checked against GoPlus and Chainabuse threat intelligence. The score starts at 100 and drops proportionally as more spenders turn out to be flagged as malicious or reported.

Phishing Target Score — checks Sentinel's community threat-report database (Supabase) for reports naming this exact wallet address as a target. Each matching report adds 0.25, capped at 1.`,
  },
  {
    title: "Response — GET /api/wallet-health",
    body: `Returns the wallet's approvals, risk flags, and the three computed scores. Scoring degrades gracefully — if a price lookup or a Supabase query fails, the affected item is skipped or noted in riskFlags rather than failing the whole request, so a partial outage won't return an error, only a less complete picture.

The "amount" field is the raw on-chain approval value (e.g. the standard max-uint256 for an "unlimited" approval) and is not formatted for display — callers should format it before showing it to a user.`,
    code: `{
  "address": "0x...",
  "approvals": [
    {
      "token": "0x...",
      "spender": "0x...",
      "amount": "115792089237316195423570985008687907853269984665640564039457584007913129639935",
      "label": "...",
      "valueUsd": 1234.56  // present only for unlimited approvals
    }
  ],
  "riskFlags": ["..."],
  "contractSafetyScore": 0-100,
  "unlimitedApprovalExposureUsd": 0,
  "phishingTargetScore": 0-1
}

// Error responses
400  { "error": "address query parameter is required." }
500  { "error": "Failed to check wallet health." } // or a specific validation message
}`,
  },
  {
    title: "POST /api/revoke",
    body: `Builds an unsigned transaction to revoke an ERC-20 token approval (sets the allowance back to 0). Sentinel's backend never holds private keys and never signs or broadcasts anything — this endpoint only returns the transaction data needed for the frontend to pass to OKX Wallet, where the user signs and sends it themselves.

Request body:`,
    code: `{
  "tokenAddress": "0x...",    // required — the token contract
  "spenderAddress": "0x..."   // required — the approval to revoke
}`,
  },
  {
    title: "Response — POST /api/revoke",
    body: `Returns unsigned transaction data ready to be passed to the wallet for signing.`,
    code: `{
  "to": "0x...",     // the token contract to call
  "data": "0x...",   // encoded approve(spender, 0)
  "value": "0x0"     // no native token sent
}

// Error responses
400  { "error": "tokenAddress and spenderAddress are required." }
400  { "error": "Invalid token address: ..." }
400  { "error": "Invalid spender address: ..." }
}`,
  },
  {
    title: "GET /api/threat-intel",
    body: `Lists community-submitted threat reports, most recent first. This is unverified, crowd-sourced data — category and severity are set by the reporter, not by AI analysis, unlike the risk scoring in /api/scan and /api/wallet-health.`,
    code: `GET /api/threat-intel`,
  },
  {
    title: "Response — GET /api/threat-intel",
    code: `{
  "threats": [
    {
      "id": "...",
      "category": "...",
      "title": "...",
      "targetAddress": "0x...",
      "severity": "LOW | MEDIUM | HIGH | CRITICAL",
      "timestamp": "...",
      "description": "...",
      "reporter": "...",
      "upvotes": 0
    }
  ]
}

// Error response
500  { "error": "Failed to load threat reports." }`,
  },
  {
    title: "POST /api/threat-intel",
    body: `Submits a new community threat report.

Request body:`,
    code: `{
  "category": "...",         // required
  "title": "...",            // required
  "targetAddress": "0x...",  // required
  "description": "...",      // required
  "reporter": "...",         // required
  "severity": "..."          // optional, defaults to "HIGH"
}`,
  },
  {
    title: "Response — POST /api/threat-intel",
    body: `Returns the newly created threat report.`,
    code: `{
  "id": "...",
  "category": "...",
  "title": "...",
  "targetAddress": "0x...",
  "severity": "...",
  "timestamp": "...",
  "description": "...",
  "reporter": "...",
  "upvotes": 0
}

// Error responses
400  { "error": "category, title, targetAddress, description, and reporter are all required." }
500  { "error": "Failed to submit threat report." }`,
  },
  {
    title: "GET /api/price",
    body: `Fetches the current USD price of a chain's native token (e.g. OKB on X Layer). Used internally to compute USD exposure values, such as the unlimited-approval exposure figure in /api/wallet-health.

Query parameters:`,
    code: `GET /api/price?chainId=196`,
  },
  {
    title: "Response — GET /api/price",
    code: `{
  "price": 0
}

// Error responses
400  { "error": "chainId query parameter is required." }
502  { "error": "Failed to fetch price." } // or a specific upstream error message
}`,
  },
  {
    title: "Contributing",
    body: `Sentinel's source is available on GitHub under the MIT License. Issues and pull requests are welcome — see the repository's README for local setup instructions.`,
  },
];

export default function DocumentationPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
          Documentation
        </h1>
        <p className="mt-3 text-sm text-accent">
          How Sentinel works, and how to get the most out of it.
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
            {section.body && (
              <p className="text-sm text-accent leading-relaxed whitespace-pre-line">
                {section.body}
              </p>
            )}
            {section.code && (
              <pre className="mt-4 rounded-lg border border-[#1E1E1E] bg-[#0A0A0A] p-4 text-xs text-accent overflow-x-auto font-mono">
                {section.code}
              </pre>
            )}
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
