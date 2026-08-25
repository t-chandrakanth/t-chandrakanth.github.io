import { allPosts } from "@/lib/posts";
import { site } from "@/lib/site";

export const dynamic = "force-static";

const escape = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

/** RFC-822, which is what RSS 2.0 wants and what most readers actually parse. */
function rfc822(iso: string): string {
  return new Date(`${iso}T09:00:00Z`).toUTCString();
}

export async function GET() {
  const posts = allPosts();
  const updated = posts[0] ? rfc822(posts[0].date) : new Date().toUTCString();

  const items = posts
    .map(
      (p) => `    <item>
      <title>${escape(p.title)}</title>
      <link>${site.url}/writing/${p.slug}</link>
      <guid isPermaLink="true">${site.url}/writing/${p.slug}</guid>
      <pubDate>${rfc822(p.date)}</pubDate>
      <category>${escape(p.pillarName)}</category>
      <description>${escape(p.description)}</description>
    </item>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(site.blogName)} — ${escape(site.name)}</title>
    <link>${site.url}/writing</link>
    <atom:link href="${site.url}/feed.xml" rel="self" type="application/rss+xml" />
    <description>${escape(site.description)}</description>
    <language>en-us</language>
    <copyright>© ${new Date().getUTCFullYear()} ${escape(site.name)}</copyright>
    <managingEditor>${site.email} (${escape(site.name)})</managingEditor>
    <webMaster>${site.email} (${escape(site.name)})</webMaster>
    <lastBuildDate>${updated}</lastBuildDate>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
