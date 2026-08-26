import type { Metadata } from "next";
import Link from "next/link";
import { CopyButton } from "@/components/copy-button";
import { Kicker, SectionHead, Shell, Stamp } from "@/components/primitives";
import {
  byKind,
  formatCitation,
  publications,
  type Publication,
  type PublicationKind,
} from "@/content/publications";
import { pillarById } from "@/content/pillars";
import { liveProfiles, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Publications",
  description:
    "Peer-reviewed publications, preprints and work in preparation. Peer-reviewed work and preprints are listed separately, and nothing is listed before it exists.",
  alternates: { canonical: "/publications" },
};

const SECTIONS: {
  kind: PublicationKind;
  n: number;
  label: string;
  intro: string;
  empty: string;
}[] = [
  {
    kind: "peer-reviewed",
    n: 1,
    label: "Peer-reviewed",
    intro:
      "Accepted at a named venue, with a DOI or a venue link. Nothing appears in this section until both exist.",
    empty:
      "No peer-reviewed publications yet. Two manuscripts are complete and listed below under \u201cIn preparation\u201d; when one is accepted it will move up to this section with its venue and DOI, and not before.",
  },
  {
    kind: "preprint",
    n: 2,
    label: "Preprints",
    intro:
      "Posted publicly and citable, but not peer-reviewed. Listed separately because the distinction matters and collapsing it is the most common form of status inflation.",
    empty:
      "No preprints posted yet. The two completed manuscripts below are the likely first candidates.",
  },
  {
    kind: "in-preparation",
    n: 3,
    label: "In preparation",
    intro:
      "Complete manuscripts with no submission date, and work still being written. Listed in full \u2014 abstract, contributions, method and results \u2014 so the work is legible, and labelled so nobody mistakes a manuscript for a publication.",
    empty: "Nothing currently in preparation.",
  },
];

function Entry({ p, index }: { p: Publication; index: number }) {
  const citation = formatCitation(p);
  const detail = p.abstract ? `/publications/${p.id}` : undefined;
  const pillar = p.pillar ? pillarById(p.pillar) : undefined;
  return (
    <li className="border-b border-rule py-7">
      <div className="grid gap-x-8 gap-y-3 lg:grid-cols-[3.5rem_minmax(0,1fr)]">
        <span className="font-kicker text-ink-faint tabular-nums">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div>
          <h3 className="text-[clamp(1.1rem,1rem+0.5vw,1.35rem)] leading-[1.28] tracking-[-0.013em]">
            {detail ? (
              <Link href={detail} className="link-rule">
                {p.title}
              </Link>
            ) : p.url || p.doi ? (
              <a
                href={p.doi ? `https://doi.org/${p.doi}` : p.url}
                target="_blank"
                rel="noopener"
                className="link-rule"
              >
                {p.title}
              </a>
            ) : (
              p.title
            )}
          </h3>

          <p className="text-ink-muted mt-2.5 text-[0.925rem]">
            {p.authors.map((a, i) => (
              <span key={a}>
                {a === site.name ? <strong className="text-ink font-semibold">{a}</strong> : a}
                {i < p.authors.length - 1 ? ", " : ""}
              </span>
            ))}
          </p>

          {p.venue || p.year ? (
            <p className="text-ink-muted mt-1.5 text-[0.925rem] ">
              {p.venue}
              {p.venue && p.year ? ", " : ""}
              {p.year}
            </p>
          ) : null}

          {p.abstract ? (
            <p className="text-ink-muted mt-3 max-w-[64ch] text-[0.95rem] leading-relaxed">
              {p.abstract.slice(0, 240).trimEnd()}…
            </p>
          ) : null}

          {p.note ? (
            <p className="text-ink-faint mt-3 max-w-[62ch] text-[0.875rem] leading-relaxed">
              {p.note}
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
            {detail ? (
              <Link
                href={detail}
                className="link-action transition-colors"
              >
                Abstract, method &amp; results →
              </Link>
            ) : null}
            {pillar ? <Kicker className="text-ink-faint">{pillar.name}</Kicker> : null}
            {p.doi ? (
              <a
                href={`https://doi.org/${p.doi}`}
                target="_blank"
                rel="noopener"
                className="link-action transition-colors"
              >
                DOI
              </a>
            ) : null}
            {p.pdf ? (
              <a
                href={p.pdf}
                target="_blank"
                rel="noopener"
                className="link-action transition-colors"
              >
                PDF
              </a>
            ) : null}
            {p.code ? (
              <a
                href={p.code}
                target="_blank"
                rel="noopener"
                className="link-action transition-colors"
              >
                Code
              </a>
            ) : null}
            <CopyButton value={citation} label="Copy citation" />
            {p.citations ? (
              <Kicker className="text-ink-faint">
                {p.citations.count} citations · read {p.citations.asOf}
              </Kicker>
            ) : null}
          </div>
        </div>
      </div>
    </li>
  );
}

export default function PublicationsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Publications — ${site.name}`,
    url: `${site.url}/publications`,
    author: { "@type": "Person", name: site.name, url: site.url },
    hasPart: publications
      .filter((p) => p.kind !== "in-preparation")
      .map((p) => ({
        "@type": "ScholarlyArticle",
        headline: p.title,
        author: p.authors.map((a) => ({ "@type": "Person", name: a })),
        ...(p.venue ? { publisher: { "@type": "Organization", name: p.venue } } : {}),
        ...(p.date ? { datePublished: p.date } : {}),
        ...(p.doi ? { identifier: `https://doi.org/${p.doi}` } : {}),
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
          <Kicker className="text-accent reveal">Publications</Kicker>
          <h1
            className="display reveal mt-5 text-[clamp(2.4rem,1.5rem+3.6vw,4.2rem)]"
            style={{ animationDelay: "60ms" }}
          >
            The citable record
          </h1>
          <p
            className="text-ink-muted reveal mt-6 max-w-[58ch] text-[1.0625rem] leading-relaxed"
            style={{ animationDelay: "120ms" }}
          >
            Peer-reviewed work, preprints and work in preparation are listed in
            separate sections, because the difference between them is the whole
            point of the list. Citation counts, where present, are refreshed
            manually and stamped with the date they were read.
          </p>
        </header>

        <div className="mt-16 grid gap-14 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-20">
          <div className="min-w-0 max-w-[48rem]">
            {SECTIONS.map((s) => {
              const items = byKind(s.kind);
              return (
                <section key={s.kind} className={s.n > 1 ? "mt-20" : ""}>
                  <SectionHead
                    n={s.n}
                    label={s.label}
                    intro={s.intro}
                    action={<Kicker className="tabular-nums">{items.length}</Kicker>}
                  />
                  {items.length ? (
                    <ol className="border-t border-rule">
                      {items.map((p, i) => (
                        <Entry key={p.id} p={p} index={i} />
                      ))}
                    </ol>
                  ) : (
                    <p className="text-ink-muted border-y border-rule py-7 text-[0.975rem] leading-relaxed ">
                      {s.empty}
                    </p>
                  )}
                </section>
              );
            })}
          </div>

          <aside className="min-w-0 lg:pt-2">
            <div className="lg:sticky lg:top-24">
              <Kicker className="border-t border-rule-strong pt-3">Indexed at</Kicker>
              <ul className="mt-4 space-y-2.5">
                {liveProfiles()
                  .filter((p) => ["ORCID", "Google Scholar", "Semantic Scholar", "arXiv"].includes(p.label))
                  .map((p) => (
                    <li key={p.label}>
                      <a
                        href={p.href}
                        target="_blank"
                        rel="me noopener"
                        className="link-quiet text-ink-muted text-[0.95rem]"
                      >
                        {p.label}
                        <span aria-hidden="true" className="ml-1 opacity-60">↗</span>
                      </a>
                    </li>
                  ))}
                <li className="text-ink-faint text-[0.875rem] leading-relaxed">
                  Scholarly profiles are being established alongside the first
                  submission and will be linked here once they resolve to
                  something.
                </li>
              </ul>

              <div className="mt-10">
                <Kicker className="border-t border-rule pt-3">Meanwhile</Kicker>
                <p className="text-ink-muted mt-3 text-[0.925rem] leading-relaxed">
                  The essays under{" "}
                  <Link href="/writing" className="link-rule text-ink">
                    {site.blogName}
                  </Link>{" "}
                  are the discoverable form of this work, and the{" "}
                  <Link href="/research" className="link-rule text-ink">
                    research programme
                  </Link>{" "}
                  states where each strand actually stands.
                </p>
              </div>

              <p className="text-ink-faint mt-10 border-t border-rule pt-3 text-[0.8125rem] leading-relaxed ">
                Self-published essays are not peer-reviewed scholarly articles,
                and this page does not present them as such.
              </p>
            </div>
          </aside>
        </div>
      </Shell>
    </>
  );
}
