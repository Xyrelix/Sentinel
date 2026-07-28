import { DocsSidebar } from "@/components/docs/DocsSidebar";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
          Documentation
        </h1>
        <p className="mt-3 text-sm text-accent">
          How Sentinel works, and how to get the most out of it.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-10">
        <DocsSidebar />
        <div className="flex-1 space-y-10 min-w-0">{children}</div>
      </div>
    </div>
  );
}
