import { DocSection } from "@/components/docs/DocSection";
import { ApiServiceSection, ApiServiceData } from "@/components/docs/ApiServiceSection";

export const metadata = {
  title: "API Reference | Sentinel Docs",
};

const overview = {
  title: "API Overview",
  body: `Sentinel exposes a small set of internal API routes consumed by the frontend:`,
  code: `POST /api/scan            Analyze a transaction, address, ENS name, or domain
GET  /api/wallet-health   Check wallet approvals, exposure, and risk scores (?address=0x...)
GET  /api/threat-intel    List community-submitted threat reports
POST /api/threat-intel    Submit a community threat report
POST /api/revoke          Build an unsigned approval-revoke transaction
GET  /api/price           Fetch a chain's native token price in USD (?chainId=196)`,
};

const services: ApiServiceData[] = [
  {
    title: "Scan",
    description:
      "Runs a pre-signature risk scan and routes automatically based on the shape of the target.",
    endpoints: [
      {
        method: "POST",
        path: "/api/scan",
        summary: `Sentinel routes the request based on the shape of the target:

- ENS name (e.g. "vitalik.eth") — resolved to an address before scanning, with the resolution noted in the response reasons.
- Domain (e.g. a website URL) — routed to phishing-site detection instead of transaction analysis.
- Contract/wallet address or raw transaction — analyzed directly for risk.`,
        request: `{
  "to": "0x... | ENS name | domain",   // required
  "from": "0x...",                     // optional, defaults to a burn address
  "data": "0x...",                     // optional calldata
  "value": "0",                        // optional, wei as string
  "chainId": 196                       // optional
}`,
        responseSummary: `Returns a risk score and label, plus supporting reasons. If an ENS name was resolved, the resolved address is included.`,
        response: `{
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
    ],
  },
  {
    title: "Wallet Health",
    description:
      "Reads a wallet's on-chain approvals against Sentinel's watchlist and returns a full risk summary — read-only, never signs or sends anything.",
    endpoints: [
      {
        method: "GET",
        path: "/api/wallet-health",
        summary: `Checks a wallet's token approvals against Sentinel's watchlist and returns a full risk summary, without ever signing or sending anything — it only reads on-chain state.`,
        request: `GET /api/wallet-health?address=0x...`,
        extra: {
          title: "What It Checks",
          body: `For each token/spender pair on Sentinel's watchlist, the wallet's current allowance is checked on-chain. Any nonzero approval is returned; unlimited approvals are flagged as a risk. The wallet's native OKB balance is also checked (a zero balance is flagged as informational, not a security risk).

Three headline scores are computed from this same data:

Unlimited Approval Exposure (USD) — for each unlimited approval, Sentinel prices the wallet's live token balance (not the approved amount, since that's often effectively infinite) via CoinGecko and sums the drainable USD value. Tokens without a listed price are excluded from the total and noted once in riskFlags.

Contract Safety Score — every unique spender the wallet has approved is checked against GoPlus and Chainabuse threat intelligence. The score starts at 100 and drops proportionally as more spenders turn out to be flagged as malicious or reported.

Phishing Target Score — checks Sentinel's community threat-report database (Supabase) for reports naming this exact wallet address as a target. Each matching report adds 0.25, capped at 1.`,
        },
        responseSummary: `Returns the wallet's approvals, risk flags, and the three computed scores. Scoring degrades gracefully — if a price lookup or a Supabase query fails, the affected item is skipped or noted in riskFlags rather than failing the whole request, so a partial outage won't return an error, only a less complete picture.

The "amount" field is the raw on-chain approval value (e.g. the standard max-uint256 for an "unlimited" approval) and is not formatted for display — callers should format it before showing it to a user.`,
        response: `{
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
500  { "error": "Failed to check wallet health." } // or a specific validation message`,
      },
    ],
  },
  {
    title: "Revoke",
    description:
      "Builds an unsigned approval-revoke transaction for the frontend to pass to the wallet for signing — the backend never holds keys.",
    endpoints: [
      {
        method: "POST",
        path: "/api/revoke",
        summary: `Builds an unsigned transaction to revoke an ERC-20 token approval (sets the allowance back to 0). Sentinel's backend never holds private keys and never signs or broadcasts anything — this endpoint only returns the transaction data needed for the frontend to pass to OKX Wallet, where the user signs and sends it themselves.`,
        request: `{
  "tokenAddress": "0x...",    // required — the token contract
  "spenderAddress": "0x..."   // required — the approval to revoke
}`,
        responseSummary: `Returns unsigned transaction data ready to be passed to the wallet for signing.`,
        response: `{
  "to": "0x...",     // the token contract to call
  "data": "0x...",   // encoded approve(spender, 0)
  "value": "0x0"     // no native token sent
}

// Error responses
400  { "error": "tokenAddress and spenderAddress are required." }
400  { "error": "Invalid token address: ..." }
400  { "error": "Invalid spender address: ..." }`,
      },
    ],
  },
  {
    title: "Threat Intel",
    description:
      "Community and third-party threat reports — unverified, crowd-sourced data distinct from Sentinel's AI risk scoring.",
    endpoints: [
      {
        method: "GET",
        path: "/api/threat-intel",
        summary: `Lists community-submitted threat reports, most recent first. This is unverified, crowd-sourced data — category and severity are set by the reporter, not by AI analysis, unlike the risk scoring in /api/scan and /api/wallet-health.`,
        request: `GET /api/threat-intel`,
        response: `{
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
        method: "POST",
        path: "/api/threat-intel",
        summary: `Submits a new community threat report.`,
        request: `{
  "category": "...",         // required
  "title": "...",            // required
  "targetAddress": "0x...",  // required
  "description": "...",      // required
  "reporter": "...",         // required
  "severity": "..."          // optional, defaults to "HIGH"
}`,
        responseSummary: `Returns the newly created threat report.`,
        response: `{
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
    ],
  },
  {
    title: "Price",
    description:
      "Fetches a chain's native token price in USD, used internally to compute USD exposure figures.",
    endpoints: [
      {
        method: "GET",
        path: "/api/price",
        summary: `Fetches the current USD price of a chain's native token (e.g. OKB on X Layer). Used internally to compute USD exposure values, such as the unlimited-approval exposure figure in /api/wallet-health.`,
        request: `GET /api/price?chainId=196`,
        response: `{
  "price": 0
}

// Error responses
400  { "error": "chainId query parameter is required." }
502  { "error": "Failed to fetch price." } // or a specific upstream error message`,
      },
    ],
  },
];

export default function DocsApiPage() {
  return (
    <>
      <DocSection {...overview} />
      {services.map((service) => (
        <ApiServiceSection key={service.title} {...service} />
      ))}
    </>
  );
}
