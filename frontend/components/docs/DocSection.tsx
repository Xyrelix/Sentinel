export interface DocSectionData {
  title: string;
  body?: string;
  code?: string;
}

export function DocSection({ title, body, code }: DocSectionData) {
  return (
    <section className="border-b border-[#1E1E1E] pb-8 last:border-0">
      <h2 className="text-lg font-bold text-white mb-3">{title}</h2>
      {body && (
        <p className="text-sm text-accent leading-relaxed whitespace-pre-line">
          {body}
        </p>
      )}
      {code && (
        <pre className="mt-4 rounded-lg border border-[#1E1E1E] bg-[#0A0A0A] p-4 text-xs text-accent overflow-x-auto font-mono">
          {code}
        </pre>
      )}
    </section>
  );
}
