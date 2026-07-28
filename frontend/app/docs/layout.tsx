import { DocsHeader } from "@/components/docs/DocsHeader";
import { DocsSidebar } from "@/components/docs/DocsSidebar";
import { DocsPageHeading } from "@/components/docs/DocsPageHeading";
import { DocsToc } from "@/components/docs/DocsToc";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <DocsHeader />

      <div className="mx-auto flex w-full max-w-7xl flex-1 items-start gap-10 px-4 py-12 sm:px-6 lg:px-8">
        <DocsSidebar />

        <main id="doc-content" className="min-w-0 flex-1">
          <DocsPageHeading />
          <div className="space-y-10">{children}</div>
        </main>

        <DocsToc />
      </div>
    </div>
  );
}
