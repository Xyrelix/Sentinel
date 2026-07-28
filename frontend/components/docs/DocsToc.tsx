"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface HeadingItem {
  id: string;
  text: string;
}

export function DocsToc() {
  const pathname = usePathname();
  const [headings, setHeadings] = useState<HeadingItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("#doc-content section[id]"),
    );

    setHeadings(
      sections.map((section) => ({
        id: section.id,
        text: section.querySelector("h2")?.textContent ?? section.id,
      })),
    );
    setActiveId(sections[0]?.id ?? "");

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: "-100px 0px -70% 0px" },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [pathname]);

  if (headings.length < 2) return null;

  return (
    <nav className="hidden xl:block w-56 shrink-0 sticky top-24 self-start max-h-[calc(100vh-7rem)] overflow-y-auto">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-accent/60">
        On this page
      </p>
      <ul className="space-y-1.5 border-l border-[#1E1E1E]">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              className={cn(
                "block -ml-px border-l-2 py-1 pl-3 text-sm transition-colors",
                activeId === heading.id
                  ? "border-primary text-white font-semibold"
                  : "border-transparent text-accent hover:text-white",
              )}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
