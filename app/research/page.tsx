import type { Metadata } from "next";
import Link from "next/link";
import { Kicker, SectionHead, Shell, Stamp } from "@/components/primitives";
import { pillars } from "@/content/pillars";
import { projects, statusMeta, thesis } from "@/content/research";
import { postsByPillar } from "@/lib/posts";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Research programme",
  description:
    "A research programme on trustworthy AI for regulated finance: graph-based reconciliation, constraint-aware learning under accounting identities, disclosure risk beyond masking, and governance evidence a control tester can accept.",
  alternates: { canonical: "/research" },
};

export default function ResearchPage() {
  const researchPillars = pillars.filter((p) => p.research);

  return (
    <Shell width="wide" className="pt-14 pb-24 sm:pt-20">
      <header className="max-w-[52rem]">
        <Kicker className="text-accent reveal">Research programme</Kicker>
        <h1
          className="display reveal mt-5 max-w-[20ch] text-[clamp(2.1rem,1.3rem+3.2vw,3.8rem)]"
          style={{ animationDelay: "60ms" }}
        >
          {thesis.statement}
        </h1>
      </header>

      <div className="mt-14 grid gap-14 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] lg:gap-20">
        <div className="max-w-[46rem]">
          {thesis.body.map((para, i) => (
            <p
              key={i}
              className={`text-ink-muted text-[1.0625rem] leading-relaxed ${i > 0 ? "mt-5" : ""}`}
            >
              {para}
            </p>
          ))}
        </div>
        <aside className="lg:pt-1">
          <Kicker className="border-t border-rule-strong pt-3">Status vocabulary</Kicker>
          <dl className="mt-4 space-y-3">
            {(
              [
                ["exploratory", "An open question being read into. No artifact yet."],
                ["in-progress", "Active work with a defined artifact and no external date."],
                ["framework", "A stated framework, published here, not externally reviewed."],
                ["preprint", "Posted to a public preprint server, with a link."],
                ["under-review", "Submitted to a named venue, with a submission date."],
                ["published", "Accepted and available, with a DOI or venue link."],
              ] as const
            ).map(([key, meaning]) => (
              <div key={key} className="flex flex-col gap-1.5 border-t border-rule pt-3 sm:flex-row sm:gap-4">
                <dt className="shrink-0 sm:w-[7.5rem]">
                  <Stamp tone={statusMeta[key].tone}>{statusMeta[key].label}</Stamp>
                </dt>
                <dd className="text-ink-faint text-[0.85rem] leading-relaxed">{meaning}</dd>
              </div>
            ))}
          </dl>
          <p className="text-ink-faint mt-6 border-t border-rule pt-3 text-[0.8125rem] leading-relaxed italic">
            No status on this page is promoted ahead of its evidence. If something
            says “in progress”, it is in progress.
          </p>
        </aside>
      </div>

      {/* ---------------- pillars ---------------- */}
      <section className="mt-24">
        <SectionHead
          n={1}
          label="Five pillars"
          intro="The programme is organised around five research pillars. A sixth writing pillar covers applied systems work that informs the research without being part of it."
        />
        <ol className="grid gap-x-10 md:grid-cols-2 lg:grid-cols-3">
          {researchPillars.map((p) => {
            const n = postsByPillar(p.id).length;
            return (
              <li key={p.id} className="border-t border-rule py-6">
                <div className="flex items-baseline gap-3">
                  <span className="font-kicker text-accent tabular-nums">{p.id}</span>
                  <h3 className="flex-1 text-[1.1rem] leading-snug tracking-[-0.012em]">{p.name}</h3>
                </div>
                <p className="text-ink-muted mt-2.5 text-[0.925rem] leading-relaxed">{p.blurb}</p>
                {n > 0 ? (
                  <Link
                    href={`/writing?pillar=${p.id}`}
                    className="font-kicker text-ink-faint hover:text-accent mt-3.5 inline-block transition-colors"
                  >
                    {n} {n === 1 ? "essay" : "essays"} →
                  </Link>
                ) : (
                  <Kicker className="text-ink-faint/60 mt-3.5">No essays yet</Kicker>
                )}
              </li>
            );
          })}
        </ol>
      </section>

      {/* ---------------- projects ---------------- */}
      <section className="mt-24">
        <SectionHead
          n={2}
          label="Projects"
          intro="Six strands, each with the status it has actually earned. Projects marked as withheld describe the problem only — mechanism stays unpublished until a provisional application is on file, because public disclosure destroys novelty."
        />

        <ol className="border-t border-rule-strong">
          {projects.map((p, i) => {
            const pillar = pillars.find((x) => x.id === p.pillar);
            return (
              <li key={p.slug} className="border-b border-rule py-9">
                <div className="grid gap-x-10 gap-y-5 lg:grid-cols-[minmax(0,9rem)_minmax(0,50rem)]">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 lg:block">
                    <span className="font-kicker text-ink-faint tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-kicker text-accent lg:mt-2 lg:block">{p.code}</span>
                    <span className="lg:mt-3 lg:block">
                      <Stamp tone={statusMeta[p.status].tone}>{statusMeta[p.status].label}</Stamp>
                    </span>
                  </div>

                  <div>
                    <h3 className="text-[clamp(1.2rem,1.05rem+0.6vw,1.5rem)] leading-[1.22] tracking-[-0.015em]">
                      {p.title}
                    </h3>
                    <p className="text-ink mt-3 max-w-[58ch] text-[1.0625rem] leading-snug italic">
                      {p.question}
                    </p>
                    <p className="text-ink-muted mt-4 max-w-[64ch] text-[0.975rem] leading-relaxed">
                      {p.summary}
                    </p>

                    <dl className="mt-6 grid max-w-[44rem] gap-x-10 gap-y-4 sm:grid-cols-2">
                      <div>
                        <Kicker className="border-t border-rule pt-2.5">Pillar</Kicker>
                        <dd className="text-ink-muted mt-2 text-[0.9rem]">
                          {pillar ? (
                            <Link href={`/writing?pillar=${pillar.id}`} className="link-quiet">
                              {pillar.id} · {pillar.name}
                            </Link>
                          ) : (
                            "—"
                          )}
                        </dd>
                      </div>
                      <div>
                        <Kicker className="border-t border-rule pt-2.5">Artifacts</Kicker>
                        <dd className="mt-2">
                          <ul className="space-y-1.5">
                            {p.artifacts.map((a) => (
                              <li key={a.label} className="text-ink-muted text-[0.9rem] leading-snug">
                                {a.href ? (
                                  <Link href={a.href} className="link-rule text-ink">
                                    {a.label}
                                  </Link>
                                ) : (
                                  <span>{a.label}</span>
                                )}
                                {a.note ? (
                                  <span className="text-ink-faint"> — {a.note}</span>
                                ) : null}
                              </li>
                            ))}
                          </ul>
                        </dd>
                      </div>
                    </dl>

                    {p.patentSensitive ? (
                      <p className="font-kicker text-pending mt-5 inline-flex items-center gap-2 border border-pending/40 bg-pending/[0.06] px-3 py-1.5 normal-case tracking-normal [font-size:0.75rem]">
                        Mechanism withheld pending provisional filing
                      </p>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {/* ---------------- how this works ---------------- */}
      <section className="mt-24">
        <SectionHead n={3} label="How the programme runs" />
        <div className="grid gap-x-10 gap-y-8 md:grid-cols-3">
          {[
            {
              h: "Paper, post, repo",
              b: "Every strand is meant to produce three things: a citable object, a discoverable one, and a usable one. The paper is the citation, the essay is the reach, the repository is what someone else can actually run.",
            },
            {
              h: "Synthetic data only",
              b: "Every dataset on this site is generated. Where a generator exists it is published alongside the result, so the numbers are reproducible by anyone who wants to disagree with them.",
            },
            {
              h: "Statuses do not inflate",
              b: "A framework is not a result and a draft is not a preprint. Statuses on this page move in one direction only, and only when there is a link to point at.",
            },
          ].map((c) => (
            <div key={c.h} className="border-t border-rule pt-5">
              <h3 className="text-[1.05rem] tracking-[-0.012em]">{c.h}</h3>
              <p className="text-ink-muted mt-2.5 text-[0.925rem] leading-relaxed">{c.b}</p>
            </div>
          ))}
        </div>
        <p className="text-ink-faint mt-12 max-w-[60ch] text-[0.85rem] leading-relaxed italic">
          Working on any of this? {" "}
          <Link href="/contact" className="link-rule text-ink-muted">
            Get in touch
          </Link>
          . I read everything, and I am particularly interested in disagreement
          from people who have run these systems in production.
        </p>
      </section>
    </Shell>
  );
}
