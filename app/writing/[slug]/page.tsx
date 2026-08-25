import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReadingProgress } from "@/components/reading-progress";
import { ReadingRail } from "@/components/reading-rail";
import { Kicker, Rule, Shell, Stamp } from "@/components/primitives";
import { adjacentPosts, allPosts, getPost, relatedPosts } from "@/lib/posts";
import { formatDate } from "@/lib/format";
import { disclaimer, site } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return allPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};

  const url = `${site.url}/writing/${post.slug}`;
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/writing/${post.slug}` },
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description: post.description,
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      authors: [site.url],
      section: post.pillarName,
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const { default: MDXContent } = await import(`@/content/writing/${slug}.mdx`);
  const related = relatedPosts(slug, 3);
  const { prev, next } = adjacentPosts(slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    inLanguage: "en-US",
    wordCount: post.words,
    articleSection: post.pillarName,
    keywords: post.tags?.join(", "),
    author: { "@type": "Person", name: site.name, url: site.url },
    publisher: { "@type": "Person", name: site.name, url: site.url },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${site.url}/writing/${post.slug}`,
    },
    isPartOf: {
      "@type": "Blog",
      name: site.blogName,
      url: `${site.url}/writing`,
    },
  };

  return (
    <>
      <ReadingProgress />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article>
        {/* ---------- masthead ---------- */}
        <Shell width="wide" className="pt-12 sm:pt-20">
          <div className="mx-auto grid max-w-[64rem] lg:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] lg:gap-14">
            <div className="hidden lg:block" />
            <header className="max-w-[46rem]">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 reveal">
                <Link
                  href={`/writing?pillar=${post.pillar}`}
                  className="font-kicker text-accent hover:text-accent-hi transition-colors"
                >
                  {post.pillarName}
                </Link>
                <span aria-hidden="true" className="text-rule-strong">/</span>
                <Kicker as="span">
                  <time dateTime={post.date}>{formatDate(post.date)}</time>
                </Kicker>
                {post.draft ? <Stamp tone="pending">Draft</Stamp> : null}
              </div>

              <h1
                className="display mt-6 text-[clamp(2.1rem,1.35rem+3.1vw,3.6rem)] reveal"
                style={{ animationDelay: "60ms" }}
              >
                {post.title}
              </h1>

              <p
                className="text-ink-muted mt-6 max-w-[46ch] text-[clamp(1.1rem,1rem+0.4vw,1.3rem)] leading-[1.5] italic reveal"
                style={{ animationDelay: "120ms" }}
              >
                {post.description}
              </p>

              <div
                className="font-kicker text-ink-faint mt-9 flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-rule py-3 reveal"
                style={{ animationDelay: "180ms" }}
              >
                <span>{post.readingMinutes} min read</span>
                <span aria-hidden="true" className="text-rule-strong">·</span>
                <span>{post.words.toLocaleString("en-US")} words</span>
                {post.updated ? (
                  <>
                    <span aria-hidden="true" className="text-rule-strong">·</span>
                    <span>Updated {formatDate(post.updated)}</span>
                  </>
                ) : null}
              </div>
            </header>
          </div>
        </Shell>

        {/* ---------- body ---------- */}
        <Shell width="wide" className="mt-14">
          <div className="mx-auto grid max-w-[64rem] lg:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] lg:gap-14">
            <aside className="mb-12 lg:mb-0">
              <div className="lg:sticky lg:top-24">
                <ReadingRail sections={post.sections} />
                {post.quotable ? (
                  <p className="text-ink-muted mt-10 hidden border-t border-rule pt-4 text-[0.9rem] leading-snug italic lg:block">
                    “{post.quotable}”
                  </p>
                ) : null}
              </div>
            </aside>

            <div id="article-body" className="prose max-w-[46rem]">
              <MDXContent />
            </div>
          </div>
        </Shell>
      </article>

      {/* ---------- apparatus ---------- */}
      <Shell width="wide" className="mt-24">
        <div className="mx-auto grid max-w-[64rem] lg:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] lg:gap-14">
          <div className="hidden lg:block" />
          <div className="max-w-[46rem]">
            <div className="border-t border-rule-strong pt-5">
              <Kicker>Citation &amp; canonical</Kicker>
              <p className="text-ink-muted mt-3 text-[0.9rem] leading-relaxed">
                Cite as: {site.name}, “{post.title},” <em>{site.blogName}</em>,{" "}
                {formatDate(post.date)}.{" "}
                <a href={`${site.url}/writing/${post.slug}`} className="link-rule text-ink">
                  {site.url.replace(/^https?:\/\//, "")}/writing/{post.slug}
                </a>
              </p>
              <p className="text-ink-faint mt-3 text-[0.8125rem] leading-relaxed italic">
                {disclaimer}
              </p>
            </div>

            {(prev || next) && (
              <nav
                aria-label="More writing"
                className="mt-14 grid gap-px border border-rule bg-rule sm:grid-cols-2"
              >
                {prev ? (
                  <Link
                    href={`/writing/${prev.slug}`}
                    className="group bg-paper p-5 no-underline transition-colors hover:bg-paper-raised"
                  >
                    <Kicker>← Previous</Kicker>
                    <span className="text-ink mt-2 block text-[1.05rem] leading-snug tracking-[-0.012em] group-hover:text-accent">
                      {prev.title}
                    </span>
                  </Link>
                ) : (
                  <span className="bg-paper p-5" />
                )}
                {next ? (
                  <Link
                    href={`/writing/${next.slug}`}
                    className="group bg-paper p-5 text-right no-underline transition-colors hover:bg-paper-raised"
                  >
                    <Kicker>Next →</Kicker>
                    <span className="text-ink mt-2 block text-[1.05rem] leading-snug tracking-[-0.012em] group-hover:text-accent">
                      {next.title}
                    </span>
                  </Link>
                ) : (
                  <span className="bg-paper p-5" />
                )}
              </nav>
            )}

            {related.length > 0 && (
              <section className="mt-16">
                <Kicker className="border-t border-rule-strong pt-3">Related</Kicker>
                <ul className="mt-5 space-y-px">
                  {related.map((r) => (
                    <li key={r.slug}>
                      <Link
                        href={`/writing/${r.slug}`}
                        className="group flex flex-col gap-1 border-b border-rule py-4 no-underline sm:flex-row sm:items-baseline sm:gap-5"
                      >
                        <Kicker className="shrink-0 sm:w-28">{r.pillarName.split(" ")[0]}</Kicker>
                        <span className="text-ink flex-1 text-[1.05rem] leading-snug tracking-[-0.012em] transition-colors group-hover:text-accent">
                          {r.title}
                        </span>
                        <Kicker className="shrink-0">{r.readingMinutes} min</Kicker>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <Rule className="mt-16" />
          </div>
        </div>
      </Shell>
    </>
  );
}
