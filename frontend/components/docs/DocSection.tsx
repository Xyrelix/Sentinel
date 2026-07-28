export interface DocSectionData {
  title: string;
  body?: string;
  code?: string;
}

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function DocSection({ title, body, code }: DocSectionData) {
  const id = slugify(title);

  return (
    <section id={id} className="scroll-mt-28 border-b border-[#1E1E1E] pb-8 last:border-0">
      <a href={`#${id}`} className="group inline-flex w-fit items-center gap-2">
        <h2 className="text-lg font-bold text-white">{title}</h2>
        <span className="text-primary opacity-0 transition-opacity group-hover:opacity-100">
          #
        </span>
      </a>
      {body && (
        <p className="mt-3 text-sm text-accent leading-relaxed whitespace-pre-line">
          {body}
        </p>
      )}
      {code && (
        <div className="mt-4 overflow-hidden rounded-xl border border-[#1E1E1E] bg-[#0A0A0A]">
          <div className="flex items-center gap-1.5 border-b border-[#1E1E1E] bg-white/[0.02] px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-primary/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
          </div>
          <pre className="overflow-x-auto p-4 text-xs text-accent font-mono leading-relaxed">
            {code}
          </pre>
        </div>
      )}
    </section>
  );
}
