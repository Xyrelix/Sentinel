import { ApiEndpoint, ApiEndpointData } from "./ApiEndpoint";
import { slugify } from "./slugify";

export interface ApiServiceData {
  title: string;
  description: string;
  endpoints: ApiEndpointData[];
}

export function ApiServiceSection({ title, description, endpoints }: ApiServiceData) {
  const id = slugify(title);

  return (
    <section id={id} className="scroll-mt-28 border-b border-[#1E1E1E] pb-8 last:border-0">
      <a href={`#${id}`} className="group inline-flex w-fit items-center gap-2">
        <h2 className="text-lg font-bold text-white">{title}</h2>
        <span className="text-primary opacity-0 transition-opacity group-hover:opacity-100">
          #
        </span>
      </a>
      <p className="mt-2 text-sm text-accent leading-relaxed">{description}</p>

      <div className="divide-y divide-[#1E1E1E]">
        {endpoints.map((endpoint) => (
          <ApiEndpoint key={`${endpoint.method}-${endpoint.path}`} {...endpoint} />
        ))}
      </div>
    </section>
  );
}
