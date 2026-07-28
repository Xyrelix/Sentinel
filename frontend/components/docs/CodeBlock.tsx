import { cn } from "@/lib/utils";

export function CodeBlock({
  code,
  label,
  className,
}: {
  code: string;
  label?: string;
  className?: string;
}) {
  return (
    <div className={cn("overflow-hidden rounded-xl border border-[#1E1E1E] bg-[#0A0A0A]", className)}>
      <div className="flex items-center gap-1.5 border-b border-[#1E1E1E] bg-white/[0.02] px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-primary/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
        {label && (
          <span className="ml-2 text-[10px] font-semibold uppercase tracking-widest text-accent/70">
            {label}
          </span>
        )}
      </div>
      <pre className="overflow-x-auto p-4 text-xs text-accent font-mono leading-relaxed">{code}</pre>
    </div>
  );
}
