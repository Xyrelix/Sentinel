export interface DocsNavLink {
  href: string;
  label: string;
  icon: string;
  description: string;
}

export const docsNav: DocsNavLink[] = [
  {
    href: "/docs",
    label: "Overview",
    icon: "book-open",
    description: "How Sentinel works, and how to get the most out of it.",
  },
  {
    href: "/docs/features",
    label: "Features",
    icon: "layers",
    description: "What each view in the app does, from scanning to revoking approvals.",
  },
  {
    href: "/docs/architecture",
    label: "Architecture",
    icon: "network",
    description: "The stack, data flow, and how scan pricing works.",
  },
  {
    href: "/docs/api",
    label: "API Reference",
    icon: "braces",
    description: "Internal API routes consumed by the frontend.",
  },
  {
    href: "/docs/contributing",
    label: "Contributing",
    icon: "git-branch",
    description: "Source, license, and how to contribute.",
  },
];
