import type { Metadata } from "next";
import { Suspense } from "react";
import { WritingIndex, type IndexPost } from "@/components/writing-index";
import { Kicker, Shell } from "@/components/primitives";
import { allPosts } from "@/lib/posts";
import { formatDate, year } from "@/lib/format";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: site.blogName,
  description:
    "Essays on graph-based financial reconciliation, constrained machine learning, enterprise AI privacy, governed agentic systems and agent engineering. One substantial piece every two weeks.",
  alternates: { canonical: "/writing", types: { "application/rss+xml": `${site.url}/feed.xml` } },
  openGraph: {
    type: "website",
    url: `${site.url}/writing`,
    title: `${site.blogName} — ${site.name}`,
    description:
      "Essays on graph-based financial reconciliation, constrained machine learning, enterprise AI privacy and governed agentic systems.",
  },
};

export default function WritingPage() {
  const posts: IndexPost[] = allPosts().map((p) => ({
    slug: p.slug,
    title: p.title,
    description: p.description,
    date: p.date,
    dateLabel: formatDate(p.date).replace(/ \d{4}$/, ""),
    yearLabel: year(p.date),
    pillar: p.pillar,
    pillarName: p.pillarName,
    readingMinutes: p.readingMinutes,
    draft: p.draft,
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: site.blogName,
    url: `${site.url}/writing`,
    description: site.description,
    author: { "@type": "Person", name: site.name, url: site.url },
    blogPost: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      description: p.description,
      datePublished: p.date,
      url: `${site.url}/writing/${p.slug}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Shell width="wide" className="pt-14 pb-24 sm:pt-20">
        <header className="max-w-[52rem]">
          <Kicker className="text-accent reveal">Journal</Kicker>
          <h1
            className="display reveal mt-5 text-[clamp(2.4rem,1.5rem+3.6vw,4.2rem)]"
            style={{ animationDelay: "60ms" }}
          >
            {site.blogName}
          </h1>
          <p
            className="text-ink-muted reveal mt-6 max-w-[58ch] text-[1.0625rem] leading-relaxed"
            style={{ animationDelay: "120ms" }}
          >
            One substantial essay every two weeks, on the systems that are not
            allowed to be approximately right. Every piece belongs to exactly one
            pillar, uses only synthetic data, and states what it does not know.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2">
            <a href="/feed.xml" className="font-kicker text-ink-faint hover:text-accent transition-colors">
              RSS
            </a>
            <span aria-hidden="true" className="text-rule-strong">·</span>
            <Kicker>{posts.length} published</Kicker>
          </div>
        </header>

        <div className="mt-14">
          <Suspense
            fallback={<div className="border-y border-rule py-12" aria-hidden="true" />}
          >
            <WritingIndex posts={posts} />
          </Suspense>
        </div>
      </Shell>
    </>
  );
}
