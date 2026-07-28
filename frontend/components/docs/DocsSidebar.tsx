"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";
import { docsNav } from "./docsNav";

export function DocsSidebar() {
  const pathname = usePathname();

  return (
    <nav className="md:w-56 md:shrink-0 md:sticky md:top-24 md:self-start">
      <p className="hidden md:block px-3 mb-3 text-xs font-semibold uppercase tracking-widest text-accent/60">
        Documentation
      </p>
      <div className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-4 md:pb-0">
        {docsNav.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "shrink-0 flex items-center gap-2.5 rounded-lg border-l-2 px-3 py-2 text-sm font-semibold transition-colors",
                isActive
                  ? "border-primary bg-primary/10 text-white"
                  : "border-transparent text-accent hover:text-white hover:bg-white/5",
              )}
            >
              <Icon
                name={link.icon}
                color={isActive ? "%23FF3B30" : "%23A1A1AA"}
                className="w-4 h-4 shrink-0"
              />
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
