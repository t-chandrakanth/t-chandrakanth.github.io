import type { Metadata } from "next";
import Link from "next/link";
import { Kicker, SectionHead, Shell } from "@/components/primitives";
import { liveProfiles, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${site.name} — collaboration, peer review, speaking, and questions about agent architecture, evaluation, and AI systems in audited environments.`,
  alternates: { canonical: "/contact" },
};

const WANTS = [
  {
    h: "Collaboration",
    b: "Especially if you have run agents against real systems — not a demo — and think some part of what I have written is wrong. Disagreement from practitioners is the most useful mail I get.",
  },
  {
    h: "Peer review and programme committees",
    b: "I review in agent engineering and evaluation, constrained and neuro-symbolic modelling, AI governance and privacy, and graph learning for financial systems. Send the venue, the deadline and the volume.",
  },
  {
    h: "Speaking",
    b: "Talks on designing the agent harness, evaluating systems with no ground truth, and what a control tester actually asks of an AI-mediated process. Copy-ready bios are on the about page.",
  },
  {
    h: "Press and citation",
    b: "Happy to be quoted on any of the above. If you are citing an essay, the citation line is at the bottom of every post.",
  },
];

export default function ContactPage() {
  const subject = encodeURIComponent("Via chandrakanth.dev");

  return (
    <Shell width="wide" className="pt-14 pb-24 sm:pt-20">
      <header className="max-w-[52rem]">
        <Kicker className="text-accent reveal">Contact</Kicker>
        <h1
          className="display reveal mt-5 max-w-[16ch] text-[clamp(2.4rem,1.5rem+3.6vw,4.2rem)]"
          style={{ animationDelay: "60ms" }}
        >
          I read everything.
        </h1>
        <p
          className="text-ink-muted reveal mt-6 max-w-[56ch] text-[1.0625rem] leading-relaxed"
          style={{ animationDelay: "120ms" }}
        >
          Email is the only channel I check reliably. I try to reply to anything
          substantive within a week; if you have not heard back in two, send it
          again — it did not offend me, it got buried.
        </p>
      </header>

      <div className="mt-14 grid gap-14 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-20">
        <div>
          <a
            href={`mailto:${site.email}?subject=${subject}`}
            className="group block rounded-[18px] border border-rule bg-paper-raised p-8 no-underline transition-colors hover:border-rule-strong hover:bg-paper-sunk sm:p-10"
          >
            <Kicker className="text-ink-faint">Email</Kicker>
            <span className="display text-ink mt-3 block text-[clamp(1.15rem,0.85rem+1.4vw,1.9rem)] [overflow-wrap:anywhere] transition-colors group-hover:text-accent">
              {site.email}
            </span>
            <span
              className="link-action mt-5 inline-flex items-center gap-2"
              aria-hidden="true"
            >
              Compose
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </span>
          </a>

          <section className="mt-16">
            <SectionHead n={1} label="What I am looking for" />
            <div className="grid gap-x-10 sm:grid-cols-2">
              {WANTS.map((w) => (
                <div key={w.h} className="border-t border-rule py-6">
                  <h3 className="text-[1.05rem] tracking-[-0.012em]">{w.h}</h3>
                  <p className="text-ink-muted mt-2.5 text-[0.925rem] leading-relaxed">{w.b}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-16">
            <SectionHead n={2} label="What will not get a useful reply" />
            <ul className="border-t border-rule">
              {[
                "Requests to review or endorse something I have not read.",
                "Anything asking me to comment on my employer's systems, roadmap or numbers. I will not, in any form.",
                "Generic outreach that does not reference anything on this site.",
              ].map((t) => (
                <li
                  key={t}
                  className="text-ink-muted border-b border-rule py-4 text-[0.95rem] leading-relaxed"
                >
                  {t}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="lg:pt-2">
          <div className="lg:sticky lg:top-24">
            <Kicker className="border-t border-rule-strong pt-3">Elsewhere</Kicker>
            <ul className="mt-4 space-y-2.5">
              {liveProfiles().map((p) => (
                <li key={p.label}>
                  <a
                    href={p.href}
                    target="_blank"
                    rel="me noopener"
                    className="link-quiet text-ink-muted text-[0.95rem]"
                  >
                    {p.label}
                    {p.handle ? <span className="text-ink-faint"> · {p.handle}</span> : null}
                    <span aria-hidden="true" className="ml-1 opacity-60">↗</span>
                  </a>
                </li>
              ))}
            </ul>

            <div className="mt-10">
              <Kicker className="border-t border-rule pt-3">Follow the writing</Kicker>
              <p className="text-ink-muted mt-3 text-[0.925rem] leading-relaxed">
                New essays land every two weeks. The{" "}
                <a href="/feed.xml" className="link-rule text-ink">
                  RSS feed
                </a>{" "}
                is the reliable way to get them, and the{" "}
                <Link href="/writing" className="link-rule text-ink">
                  index
                </Link>{" "}
                lists everything published so far.
              </p>
            </div>

            <p className="text-ink-faint mt-10 border-t border-rule pt-3 text-[0.8125rem] leading-relaxed ">
              Based in {site.location}, US Central time.
            </p>
          </div>
        </aside>
      </div>
    </Shell>
  );
}
