import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CopyButton } from "@/components/copy-button";
import { ResultsTable } from "@/components/results-table";
import { DataRow, Kicker, SectionHead, Shell, Stamp } from "@/components/primitives";
import {
  detailedPublications,
  formatBibtex,
  formatCitation,
  getPublication,
} from "@/content/publications";
import { pillarById } from "@/content/pillars";
import { getPost } from "@/lib/posts";
import { site } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return detailedPublications().map((p) => ({ slug: p.id }));
}

const KIND_LABEL = {
  "peer-reviewed": { label: "Peer-reviewed", tone: "verified" as const },
  preprint: { label: "Preprint", tone: "pending" as const },
  "in-preparation": { label: "In preparation", tone: "neutral" as const },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = getPublication(slug);
  if (!p) return {};
  const description =
    p.abstract && p.abstract.length > 200 ? `${p.abstract.slice(0, 197)}…` : (p.abstract ?? p.title);
  return {
    title: `${p.short} — ${KIND_LABEL[p.kind].label}`,
    description,
    alternates: { canonical: `/publications/${p.id}` },
    openGraph: {
      type: "article",
      url: `${site.url}/publications/${p.id}`,
      title: p.title,
      description,
    },
  };
}

export default async function PublicationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = getPublication(slug);
  if (!p || !p.abstract) notFound();

  const kind = KIND_LABEL[p.kind];
  const pillar = p.pillar ? pillarById(p.pillar) : undefined;
  const related = (p.relatedWriting ?? []).map((s) => getPost(s)).filter((x) => x !== undefined);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    headline: p.title,
    abstract: p.abstract,
    author: p.authors.map((a) => ({ "@type": "Person", name: a, url: site.url })),
    inLanguage: "en-US",
    keywords: p.keywords?.join(", "),
    creativeWorkStatus:
      p.kind === "in-preparation" ? "Unpublished manuscript" : kind.label,
    ...(p.venue ? { publisher: { "@type": "Organization", name: p.venue } } : {}),
    ...(p.doi ? { identifier: `https://doi.org/${p.doi}` } : {}),
    mainEntityOfPage: { "@type": "WebPage", "@id": `${site.url}/publications/${p.id}` },
  };

  let tableNo = 0;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Shell width="wide" className="pt-12 pb-24 sm:pt-16">
        {/* ---------------- masthead ---------------- */}
        <header className="max-w-[52rem]">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link
              href="/publications"
              className="font-kicker text-ink-faint hover:text-accent transition-colors"
            >
              ← Publications
            </Link>
            <span aria-hidden="true" className="text-rule-strong">/</span>
            <Stamp tone={kind.tone}>{kind.label}</Stamp>
            {pillar ? (
              <Link
                href={`/writing?pillar=${pillar.id}`}
                className="font-kicker text-accent hover:text-accent-hi transition-colors"
              >
                {pillar.name}
              </Link>
            ) : null}
          </div>

          <h1 className="display reveal mt-6 text-[clamp(1.9rem,1.25rem+2.6vw,3.1rem)]">
            {p.title}
          </h1>

          <p className="text-ink-muted mt-5 text-[1.0625rem]">
            {p.authors.map((a, i) => (
              <span key={a}>
                {a === site.name ? <strong className="text-ink font-semibold">{a}</strong> : a}
                {i < p.authors.length - 1 ? ", " : ""}
              </span>
            ))}
          </p>

          {p.note ? (
            <p className="font-kicker text-pending mt-5 inline-flex border border-pending/40 bg-pending/[0.06] px-3 py-1.5 normal-case tracking-normal [font-size:0.8rem]">
              {p.note}
            </p>
          ) : null}
        </header>

        <div className="mt-14 grid gap-14 lg:grid-cols-[minmax(0,46rem)_minmax(0,21rem)] lg:justify-between lg:gap-14">
          <div className="min-w-0">
            {/* ---------------- abstract ---------------- */}
            <section>
              <SectionHead n={1} label="Abstract" />
              <p className="text-[1.1rem] leading-[1.68]">{p.abstract}</p>
              {p.keywords?.length ? (
                <p className="text-ink-faint mt-6 border-t border-rule pt-3 text-[0.9rem] leading-relaxed">
                  <span className="font-kicker text-ink-muted mr-2">Keywords</span>
                  {p.keywords.join(" · ")}
                </p>
              ) : null}
            </section>

            {/* ---------------- contributions ---------------- */}
            {p.contributions?.length ? (
              <section className="mt-20">
                <SectionHead n={2} label="Contributions" />
                <ol className="border-t border-rule">
                  {p.contributions.map((c, i) => (
                    <li key={i} className="flex gap-5 border-b border-rule py-5">
                      <span className="font-kicker text-accent shrink-0 pt-1 tabular-nums">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-ink-muted text-[0.975rem] leading-relaxed">{c}</span>
                    </li>
                  ))}
                </ol>
              </section>
            ) : null}

            {/* ---------------- method ---------------- */}
            {p.method?.length ? (
              <section className="mt-20">
                <SectionHead n={3} label="Method" />
                <ul className="space-y-4">
                  {p.method.map((m, i) => (
                    <li
                      key={i}
                      className="text-ink-muted relative pl-5 text-[0.975rem] leading-relaxed before:absolute before:left-0 before:top-[0.75em] before:h-px before:w-2.5 before:bg-rule-strong"
                    >
                      {m}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {/* ---------------- results ---------------- */}
            {p.results?.length ? (
              <section className="mt-20">
                <SectionHead
                  n={4}
                  label="Results"
                  intro="All figures are from a controlled synthetic benchmark. No production or employer data appears anywhere in this work."
                />
                {p.results.map((r, i) => {
                  tableNo += 1;
                  return <ResultsTable key={i} data={r} n={tableNo} />;
                })}
              </section>
            ) : null}

            {/* ---------------- findings ---------------- */}
            {p.findings?.length ? (
              <section className="mt-20">
                <SectionHead n={5} label="What the numbers say" />
                <ul className="space-y-5">
                  {p.findings.map((f, i) => (
                    <li
                      key={i}
                      className="text-ink-muted relative pl-5 text-[0.975rem] leading-relaxed before:absolute before:left-0 before:top-[0.75em] before:h-px before:w-2.5 before:bg-accent"
                    >
                      {f}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {/* ---------------- limitations ---------------- */}
            {p.limitations?.length ? (
              <section className="mt-20">
                <SectionHead
                  n={6}
                  label="Limitations"
                  intro="Stated by the author, not extracted by a reviewer."
                />
                <ul className="space-y-5">
                  {p.limitations.map((l, i) => (
                    <li
                      key={i}
                      className="text-ink-muted relative pl-5 text-[0.975rem] leading-relaxed before:absolute before:left-0 before:top-[0.75em] before:h-px before:w-2.5 before:bg-variance"
                    >
                      {l}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>

          {/* ---------------- rail ---------------- */}
          <aside className="min-w-0 lg:pt-2">
            <div className="space-y-10 lg:sticky lg:top-24">
              {p.setup?.length ? (
                <div>
                  <Kicker className="border-t border-rule-strong pt-3">Experimental setup</Kicker>
                  <dl className="mt-2">
                    {p.setup.map((s) => (
                      <DataRow key={s.label} label={s.label} className="sm:grid-cols-1 sm:gap-1">
                        {s.value}
                      </DataRow>
                    ))}
                  </dl>
                </div>
              ) : null}

              <div>
                <Kicker className="border-t border-rule pt-3">Cite</Kicker>
                <p className="text-ink-muted mt-3 text-[0.85rem] leading-relaxed">
                  {formatCitation(p)}
                </p>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                  <CopyButton value={formatCitation(p)} label="Copy citation" />
                  <CopyButton value={formatBibtex(p)} label="Copy BibTeX" />
                </div>
                <p className="text-ink-faint mt-3 text-[0.8rem] leading-relaxed italic">
                  BibTeX is emitted as <code className="font-mono">@unpublished</code> while the
                  manuscript is unsubmitted.
                </p>
              </div>

              {related.length ? (
                <div>
                  <Kicker className="border-t border-rule pt-3">Written up as</Kicker>
                  <ul className="mt-4 space-y-3">
                    {related.map((r) => (
                      <li key={r.slug}>
                        <Link
                          href={`/writing/${r.slug}`}
                          className="link-quiet text-ink-muted block text-[0.9rem] leading-snug"
                        >
                          {r.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div>
                <Kicker className="border-t border-rule pt-3">Programme</Kicker>
                <p className="text-ink-muted mt-3 text-[0.9rem] leading-relaxed">
                  This work sits in the{" "}
                  <Link href="/research" className="link-rule text-ink">
                    research programme
                  </Link>
                  , where its current status is stated alongside everything else.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </Shell>
    </>
  );
}
