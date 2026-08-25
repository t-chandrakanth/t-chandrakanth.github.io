import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og";
import { detailedPublications, getPublication } from "@/content/publications";
import { site } from "@/lib/site";

export const alt = `${site.name} — publications`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

// Required by `output: "export"` (the GitHub Pages mirror build).
export const dynamic = "force-static";

export function generateStaticParams() {
  return detailedPublications().map((p) => ({ slug: p.id }));
}

const KIND_KICKER = {
  "peer-reviewed": "Peer-reviewed",
  preprint: "Preprint",
  "in-preparation": "Manuscript — in preparation",
} as const;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getPublication(slug);

  if (!p) {
    return renderOgImage({ kicker: "Publications", title: site.name });
  }

  // Drop the "Name: " prefix — the short name is already the kicker, and the
  // subtitle is the part that says what the paper actually does.
  const subtitle = p.title.includes(": ") ? p.title.split(": ").slice(1).join(": ") : p.title;

  return renderOgImage({
    kicker: `${p.short} · ${KIND_KICKER[p.kind]}`,
    title: subtitle,
    meta: "Research paper",
  });
}
