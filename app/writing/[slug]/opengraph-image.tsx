import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og";
import { allPosts, getPost } from "@/lib/posts";
import { site } from "@/lib/site";

export const alt = site.blogName;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

// Required by `output: "export"` (the GitHub Pages mirror build).
export const dynamic = "force-static";

export function generateStaticParams() {
  return allPosts().map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);

  return renderOgImage({
    kicker: post?.pillarName ?? site.blogName,
    title: post?.title ?? site.blogName,
    meta: post ? `${post.readingMinutes} min read` : undefined,
  });
}
