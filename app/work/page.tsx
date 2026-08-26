import type { Metadata } from "next";
import Link from "next/link";
import { Kicker, SectionHead, Shell, Stamp } from "@/components/primitives";
import { domains, earlier, throughLine } from "@/content/work";
import { currentPosition } from "@/content/cv";

export const metadata: Metadata = {
  title: "Systems built",
  description:
    "Systems built across retail and e-commerce, payments and financial operations, healthcare staffing, HCM and telecom — described by scope and scale, with no employer internals.",
  alternates: { canonical: "/work" },
};

export default function WorkPage() {
  const current = currentPosition();

  return (
    <Shell width="wide" className="pt-14 pb-24 sm:pt-20">
      <header className="max-w-[52rem]">
        <Kicker className="text-accent reveal">Systems built</Kicker>
        <h1
          className="display reveal mt-5 max-w-[20ch] text-[clamp(2.2rem,1.4rem+3.2vw,3.9rem)]"
          style={{ animationDelay: "60ms" }}
        >
          Different industries, one recurring shape.
        </h1>
        <p
          className="text-ink-muted reveal mt-6 max-w-[58ch] text-[1.0625rem] leading-relaxed"
          style={{ animationDelay: "120ms" }}
        >
          {throughLine}
        </p>
        <p
          className="text-ink-faint reveal mt-5 max-w-[58ch] text-[0.875rem] leading-relaxed "
          style={{ animationDelay: "160ms" }}
        >
          Described by scope and scale only. No internal system names, vendors,
          contract terms, volumes, thresholds or business rules appear here — not
          paraphrased, not anonymised.
        </p>
      </header>

      {/* ---------------- focus domains ---------------- */}
      <section className="mt-20">
        <SectionHead
          n={1}
          label="Where I go deepest"
          intro="Two domains carry most of the work, and they are the two the current role sits across."
        />
        <ol className="border-t border-rule-strong">
          {domains.map((d, i) => (
            <li key={d.slug} className="border-b border-rule py-10">
              <div className="grid gap-x-10 gap-y-6 lg:grid-cols-[minmax(0,11rem)_minmax(0,48rem)]">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 lg:block">
                  <span className="font-kicker text-ink-faint tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <Kicker className="text-ink-muted lg:mt-2 lg:block">{d.period}</Kicker>
                  <span className="lg:mt-3 lg:block">
                    <Stamp tone={d.orgs.includes(current.org) ? "accent" : "neutral"}>
                      {d.orgs.includes(current.org) ? "Current" : "Prior"}
                    </Stamp>
                  </span>
                </div>

                <div className="min-w-0">
                  <h2 className="text-[clamp(1.35rem,1.1rem+0.9vw,1.8rem)] leading-[1.18] tracking-[-0.016em]">
                    {d.name}
                  </h2>
                  <p className="text-ink mt-3 max-w-[56ch] text-[1.0625rem] leading-snug ">
                    {d.problem}
                  </p>
                  <p className="text-ink-muted mt-4 max-w-[64ch] text-[0.975rem] leading-relaxed">
                    {d.summary}
                  </p>

                  <div className="mt-7">
                    <Kicker className="border-t border-rule pt-2.5">Built</Kicker>
                    <ul className="mt-3 space-y-2">
                      {d.built.map((b) => (
                        <li
                          key={b}
                          className="text-ink-muted relative max-w-[64ch] pl-5 text-[0.95rem] leading-relaxed before:absolute before:left-0 before:top-[0.72em] before:h-px before:w-2.5 before:bg-rule-strong"
                        >
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 grid gap-x-10 gap-y-4 sm:grid-cols-2">
                    <div>
                      <Kicker className="border-t border-rule pt-2.5">Where</Kicker>
                      <p className="text-ink-muted mt-2 text-[0.9rem] leading-relaxed">
                        {d.orgs.join(" · ")}
                      </p>
                    </div>
                    <div>
                      <Kicker className="border-t border-rule pt-2.5">Stack</Kicker>
                      <p className="text-ink-muted mt-2 text-[0.9rem] leading-relaxed">
                        {d.stack.join(" · ")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------------- earlier ---------------- */}
      <section className="mt-20">
        <SectionHead
          n={2}
          label="Earlier work"
          intro="Real experience, not the current focus — but it is where the pattern above came from."
        />
        <ol className="grid gap-x-10 md:grid-cols-3">
          {earlier.map((e) => (
            <li key={e.org} className="border-t border-rule py-6">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-[1.05rem] leading-snug tracking-[-0.012em]">{e.name}</h3>
                <Kicker className="shrink-0 tabular-nums">{e.period}</Kicker>
              </div>
              <p className="text-accent mt-1.5 text-[0.925rem]">{e.org}</p>
              <p className="text-ink-muted mt-2.5 text-[0.925rem] leading-relaxed">{e.note}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------------- pointers ---------------- */}
      <section className="mt-20">
        <SectionHead n={3} label="Where this is written up" />
        <div className="grid gap-x-10 gap-y-8 md:grid-cols-3">
          {[
            {
              h: "The essays",
              b: "Nine long-form pieces on agents, evaluation, privacy, payments and commerce — each with an original diagram and a worked example on synthetic data.",
              href: "/writing",
              cta: "Read the writing",
            },
            {
              h: "The research programme",
              b: "Six strands with the status each has actually earned, and two complete manuscripts on graph-based and constraint-aware reconciliation.",
              href: "/research",
              cta: "See the programme",
            },
            {
              h: "The record",
              b: `The factual employment history behind all of this, currently ${current.title} at ${current.org}.`,
              href: "/cv",
              cta: "Read the CV",
            },
          ].map((c) => (
            <div key={c.h} className="border-t border-rule pt-5">
              <h3 className="text-[1.05rem] tracking-[-0.012em]">{c.h}</h3>
              <p className="text-ink-muted mt-2.5 text-[0.925rem] leading-relaxed">{c.b}</p>
              <Link
                href={c.href}
                className="link-action mt-4 inline-block transition-colors"
              >
                {c.cta} →
              </Link>
            </div>
          ))}
        </div>
        <p className="text-ink-faint mt-12 max-w-[60ch] text-[0.85rem] leading-relaxed ">
          Building something in any of these areas?{" "}
          <Link href="/contact" className="link-rule text-ink-muted">
            Get in touch
          </Link>
          . I read everything.
        </p>
      </section>
    </Shell>
  );
}
