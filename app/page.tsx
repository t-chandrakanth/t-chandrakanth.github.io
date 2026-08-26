import type { Metadata } from "next";
import Link from "next/link";
import { HeroFigure } from "@/components/hero-figure";
import { Kicker, SectionHead, Shell, Stamp } from "@/components/primitives";
import { allPosts } from "@/lib/posts";
import { formatDate } from "@/lib/format";
import { pillars } from "@/content/pillars";
import { projects, statusMeta, thesis } from "@/content/research";
import { detailedPublications } from "@/content/publications";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: `${site.name} — ${site.tagline}`,
  description: site.description,
  alternates: { canonical: "/" },
};

export default function HomePage() {
  const posts = allPosts();
  const recent = posts.slice(0, 4);
  const active = projects.filter((p) => p.status === "in-progress").slice(0, 3);
  const [givenName, ...family] = site.name.split(" ");
  const newest = posts[0]?.date;
  const papers = detailedPublications();

  return (
    <>
      {/* ================= hero ================= */}
      <section className="border-b border-rule">
        <Shell width="wide" className="pt-14 pb-16 sm:pt-20 lg:pt-24">
          <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-20">
            <div>
              <Kicker className="reveal text-accent">
                {site.blogName} — est. 2026
              </Kicker>

              <h1
                className="display reveal mt-5 text-[clamp(2.6rem,1.5rem+4.6vw,5rem)]"
                style={{ animationDelay: "60ms" }}
              >
                {givenName}
                <br />
                {family.join(" ")}
              </h1>

              <p
                className="text-ink-muted reveal mt-6 max-w-[26ch] text-[clamp(1.2rem,1rem+0.9vw,1.7rem)] leading-[1.24] tracking-[-0.019em]"
                style={{ animationDelay: "120ms" }}
              >
                {site.tagline}
              </p>

              <div
                className="rule-draw mt-9 h-px w-full bg-rule-strong"
                style={{ animationDelay: "180ms" }}
              />

              <p
                className="text-ink-muted reveal mt-7 max-w-[54ch] text-[1.0625rem] leading-relaxed"
                style={{ animationDelay: "240ms" }}
              >
                I build enterprise AI agents, and the architecture that makes
                them safe to run. Twelve years across retail commerce, payments,
                healthcare staffing, HCM and telecom taught me the same lesson
                each time: the interesting engineering is not the model, it is
                the ring of code around it and the evidence it leaves behind.
              </p>

              <p
                className="text-ink-muted reveal mt-4 max-w-[54ch] text-[1.0625rem] leading-relaxed"
                style={{ animationDelay: "290ms" }}
              >
                This site is the working record — essays under{" "}
                <Link href="/writing" className="link-rule text-ink">
                  {site.blogName}
                </Link>
                , the{" "}
                <Link href="/work" className="link-rule text-ink">
                  systems I have built
                </Link>
                , the{" "}
                <Link href="/research" className="link-rule text-ink">
                  research programme
                </Link>{" "}
                behind them, and the{" "}
                <Link href="/cv" className="link-rule text-ink">
                  factual record
                </Link>
                .
              </p>

              <div
                className="reveal mt-9 flex flex-wrap items-center gap-x-7 gap-y-3"
                style={{ animationDelay: "340ms" }}
              >
                <Link
                  href="/writing"
                  className="btn group"
                >
                  Read the writing
                  <span
                    aria-hidden="true"
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  >
                    →
                  </span>
                </Link>
                <Link href="/research" className="text-accent hover:text-accent-hi text-[1rem] tracking-[-0.018em] transition-colors">
                  Research programme
                </Link>
                <Link href="/contact" className="text-accent hover:text-accent-hi text-[1rem] tracking-[-0.018em] transition-colors">
                  Contact
                </Link>
              </div>
            </div>

            {/* Name first on small screens: this site has to win an identity
                search, and the diagram is the second thing you should read. */}
            <div className="reveal" style={{ animationDelay: "160ms" }}>
              <HeroFigure className="mx-auto h-auto w-full max-w-[26rem] lg:max-w-none" />
              <p className="font-kicker text-ink-faint mt-5 border-t border-rule pt-3 leading-relaxed normal-case tracking-normal [font-size:0.75rem]">
                Plan, act, observe, verify. The loop only earns trust at the gate,
                and the branch that matters is the one that fails it — what an
                agent does when it is wrong is the whole design.
              </p>
            </div>
          </div>
        </Shell>
      </section>

      {/* ================= record strip ================= */}
      <section className="border-b border-rule bg-paper-raised">
        <Shell width="wide">
          <dl className="grid divide-y divide-rule sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4">
            {[
              { k: "Role", v: site.role },
              { k: "Based in", v: site.location },
              { k: "Focus", v: "Enterprise AI agents & architecture" },
              { k: "Open to", v: "Collaboration, review, speaking" },
            ].map((row, i) => (
              <div
                key={row.k}
                className={`py-5 sm:py-6 ${i > 0 ? "lg:border-l lg:border-rule lg:pl-6" : ""} ${
                  i === 1 ? "sm:border-l sm:border-rule sm:pl-6 lg:pl-6" : ""
                } ${i === 3 ? "sm:border-l sm:border-rule sm:pl-6" : ""}`}
              >
                <dt className="font-kicker text-ink-faint">{row.k}</dt>
                <dd className="text-ink mt-1.5 text-[0.975rem] leading-snug">{row.v}</dd>
              </div>
            ))}
          </dl>
        </Shell>
      </section>

      {/* ================= writing ================= */}
      <section className="pt-20 sm:pt-24">
        <Shell width="wide">
          <SectionHead
            n={1}
            label="Writing"
            title={site.blogName}
            intro="One substantial piece every two weeks on agents, evaluation, and the systems that are not allowed to be approximately right. Each belongs to a single pillar, ships with an original diagram and a worked example on synthetic data, and states its own limits."
            action={
              <Link href="/writing" className="link-action transition-colors">
                All {posts.length} →
              </Link>
            }
          />

          {recent.length ? (
            <ul className="border-t border-rule">
              {recent.map((post, i) => (
                <li key={post.slug}>
                  <Link
                    href={`/writing/${post.slug}`}
                    className="group grid gap-x-8 gap-y-2 border-b border-rule py-7 no-underline md:grid-cols-[7rem_minmax(0,1fr)_5.5rem] md:items-baseline"
                  >
                    <div className="flex items-center gap-3 md:block">
                      <Kicker className="tabular-nums">{formatDate(post.date).replace(/ \d{4}$/, "")}</Kicker>
                      <Kicker className="text-rule-strong md:mt-1 md:block">
                        {String(i + 1).padStart(2, "0")}
                      </Kicker>
                    </div>
                    <div>
                      <h3 className="text-[clamp(1.2rem,1.05rem+0.7vw,1.6rem)] leading-[1.2] tracking-[-0.016em] transition-colors group-hover:text-accent">
                        {post.title}
                      </h3>
                      <p className="text-ink-muted mt-2 max-w-[62ch] text-[0.975rem] leading-relaxed">
                        {post.description}
                      </p>
                      <Kicker className="mt-3">{post.pillarName}</Kicker>
                    </div>
                    <Kicker className="md:text-right">{post.readingMinutes} min</Kicker>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-ink-muted border-y border-rule py-8 ">
              The first essays are in preparation.
            </p>
          )}
        </Shell>
      </section>

      {/* ================= research ================= */}
      <section className="pt-24">
        <Shell width="wide">
          <SectionHead
            n={2}
            label="Research programme"
            action={
              <Link href="/research" className="text-accent hover:text-accent-hi text-[1rem] tracking-[-0.018em] transition-colors">
                Full programme →
              </Link>
            }
          />

          <blockquote className="max-w-[30ch] text-[clamp(1.5rem,1.1rem+1.9vw,2.5rem)] leading-[1.16] font-semibold tracking-[-0.02em]">
            {thesis.statement}
          </blockquote>

          <div className="mt-14 grid gap-x-10 gap-y-0 md:grid-cols-2 lg:grid-cols-3">
            {pillars.map((p, i) => (
              <div key={p.id} className="border-t border-rule py-6">
                <div className="flex items-baseline gap-3">
                  <span className="font-kicker text-ink-faint tabular-nums">{p.id}</span>
                  <h3 className="text-[1.1rem] leading-snug tracking-[-0.012em]">{p.name}</h3>
                </div>
                <p className="text-ink-muted mt-2.5 text-[0.925rem] leading-relaxed">{p.blurb}</p>
              </div>
            ))}
          </div>

          {active.length > 0 && (
            <div className="mt-16 border border-rule">
              <div className="flex items-center justify-between gap-4 border-b border-rule bg-paper-raised px-5 py-3">
                <Kicker>Active projects</Kicker>
                {newest ? (
                  <Kicker className="text-ink-faint">Status as at {formatDate(newest)}</Kicker>
                ) : null}
              </div>
              <ul>
                {active.map((p) => (
                  <li
                    key={p.slug}
                    className="flex flex-col gap-3 border-b border-rule px-5 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <span className="font-kicker text-ink-faint mr-3">{p.code}</span>
                      <span className="text-[1rem] tracking-[-0.01em]">{p.short}</span>
                    </div>
                    <Stamp tone={statusMeta[p.status].tone}>{statusMeta[p.status].label}</Stamp>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {papers.length > 0 && (
            <div className="mt-14">
              <div className="flex flex-wrap items-baseline justify-between gap-4 border-t border-rule-strong pt-3">
                <Kicker className="text-ink-muted">Manuscripts</Kicker>
                <Link
                  href="/publications"
                  className="link-action transition-colors"
                >
                  All publications →
                </Link>
              </div>
              <ul className="mt-5 grid gap-x-10 md:grid-cols-2">
                {papers.map((paper) => (
                  <li key={paper.id} className="border-t border-rule py-6">
                    <Link href={`/publications/${paper.id}`} className="group block no-underline">
                      <div className="flex items-center gap-3">
                        <span className="font-kicker text-ink-muted">{paper.short}</span>
                        <Stamp tone="neutral">In preparation</Stamp>
                      </div>
                      <h3 className="mt-3 text-[1.05rem] leading-snug tracking-[-0.012em] transition-colors group-hover:text-accent">
                        {paper.title.split(": ")[1] ?? paper.title}
                      </h3>
                      <p className="text-ink-muted mt-2.5 text-[0.925rem] leading-relaxed">
                        {paper.abstract?.slice(0, 155).trimEnd()}…
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Shell>
      </section>

      {/* ================= contact ================= */}
      <section className="pt-24">
        <Shell width="wide">
          <SectionHead n={3} label="Contact" />
          <div className="grid gap-10 border-t border-rule-strong pt-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div>
              <h2 className="display text-[clamp(1.6rem,1.2rem+1.5vw,2.3rem)] max-w-[18ch]">
                If your systems have to be right, I would like to hear about it.
              </h2>
            </div>
            <div className="text-ink-muted max-w-[52ch] text-[1.0625rem] leading-relaxed">
              <p>
                I read everything sent to me about agent architecture, evaluation
                without ground truth, and putting autonomous systems into places
                that get audited. Review requests, collaboration and speaking
                enquiries are all welcome — and disagreement from people who have
                run this in production is the most useful mail I get.
              </p>
              <Link
                href="/contact"
                className="btn group mt-7"
              >
                Get in touch
                <span
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>
            </div>
          </div>
        </Shell>
      </section>
    </>
  );
}
