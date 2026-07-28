"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/docs", label: "Overview" },
  { href: "/docs/features", label: "Features" },
  { href: "/docs/architecture", label: "Architecture" },
  { href: "/docs/api", label: "API Reference" },
  { href: "/docs/contributing", label: "Contributing" },
];

export function DocsSidebar() {
  const pathname = usePathname();

  return (
    <nav className="md:w-48 md:shrink-0 md:sticky md:top-24 md:self-start">
      <div className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-4 md:pb-0">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "shrink-0 rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                isActive
                  ? "bg-primary text-white"
                  : "text-accent hover:text-white hover:bg-[#111111]",
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
