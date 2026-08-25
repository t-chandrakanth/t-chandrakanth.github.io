import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og";
import { site } from "@/lib/site";

export const alt = `${site.name} — ${site.tagline}`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

// Required by `output: "export"` (the GitHub Pages mirror build).
export const dynamic = "force-static";

export default async function Image() {
  return renderOgImage({
    kicker: site.blogName,
    title: site.tagline,
    meta: "Research · Writing",
  });
}
