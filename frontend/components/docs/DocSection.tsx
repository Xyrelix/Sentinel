import { CodeBlock } from "./CodeBlock";
import { slugify } from "./slugify";

export interface DocSectionData {
  title: string;
  body?: string;
  code?: string;
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
      {code && <CodeBlock code={code} className="mt-4" />}
    </section>
  );
}
