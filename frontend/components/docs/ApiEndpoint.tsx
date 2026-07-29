import { cn } from "@/lib/utils";
import { CodeBlock } from "./CodeBlock";

export interface ApiEndpointData {
  method: "GET" | "POST";
  path: string;
  summary?: string;
  request?: string;
  extra?: { title: string; body: string };
  responseSummary?: string;
  response?: string;
}

function MethodBadge({ method }: { method: ApiEndpointData["method"] }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-[11px] font-bold tracking-wide",
        method === "POST"
          ? "border-primary/30 bg-primary/15 text-primary"
          : "border-white/10 bg-white/10 text-white",
      )}
    >
      {method}
    </span>
  );
}

export function ApiEndpoint({
  method,
  path,
  summary,
  request,
  extra,
  responseSummary,
  response,
}: ApiEndpointData) {
  return (
    <div className="pt-6 first:pt-4">
      <div className="mb-2 flex items-center gap-2">
        <MethodBadge method={method} />
        <code className="text-sm font-mono text-white">{path}</code>
      </div>

      {summary && (
        <p className="text-sm text-accent leading-relaxed whitespace-pre-line">{summary}</p>
      )}

      {request && <CodeBlock code={request} label="Request" className="mt-3" />}

      {extra && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-white mb-2">{extra.title}</h4>
          <p className="text-sm text-accent leading-relaxed whitespace-pre-line">{extra.body}</p>
        </div>
      )}

      {responseSummary && (
        <p className="mt-4 text-sm text-accent leading-relaxed whitespace-pre-line">
          {responseSummary}
        </p>
      )}

      {response && <CodeBlock code={response} label="Response" className="mt-3" />}
    </div>
  );
}
