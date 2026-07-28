"use client";

import { usePathname } from "next/navigation";
import { docsNav } from "./docsNav";

export function DocsPageHeading() {
  const pathname = usePathname();
  const active = docsNav.find((link) => link.href === pathname) ?? docsNav[0];

  return (
    <div className="mb-10">
      <p className="text-xs font-semibold uppercase tracking-widest text-primary">
        Documentation
      </p>
      <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-white tracking-tight">
        {active.label}
      </h1>
      <p className="mt-3 max-w-2xl text-sm text-accent">{active.description}</p>
    </div>
  );
}
