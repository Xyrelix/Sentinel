import { DocSection } from "@/components/docs/DocSection";

export const metadata = {
  title: "Contributing | Sentinel Docs",
};

export default function DocsContributingPage() {
  return (
    <DocSection
      title="Contributing"
      body={`Sentinel's source is available on GitHub under the MIT License. Issues and pull requests are welcome — see the repository's README for local setup instructions.`}
    />
  );
}
